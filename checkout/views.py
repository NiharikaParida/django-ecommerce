import json
import base64
import hashlib
import hmac
import urllib.request
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from urllib.error import URLError
from urllib.parse import quote

from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.middleware.csrf import get_token

from core.models import Order, OrderItem, Product
from core.views import _cart, _order_data, _product_by_id


TAX_RATE = Decimal("0.06")
CENT = Decimal("0.01")
SHIPPING_RATES = {Decimal("0.00"), Decimal("99.00"), Decimal("199.00")}
COUPON_DISCOUNTS = {"FASHION20": Decimal("0.20")}


class RazorpayVerificationError(Exception):
	pass


class CheckoutValidationError(Exception):
	def __init__(self, detail, status=400):
		self.detail = detail
		self.status = status


def _money(value):
	return Decimal(value).quantize(CENT, rounding=ROUND_HALF_UP)


def _request_data(request):
	try:
		data = json.loads(request.body or "{}")
	except (TypeError, ValueError):
		return None
	return data if isinstance(data, dict) else None


def _customer(data):
	customer = data.get("customer", data)
	if not isinstance(customer, dict):
		return None
	fields = ("name", "email", "phone", "address", "city", "state", "postal_code")
	values = {
		field: str(customer[field]).strip() if customer.get(field) is not None else ""
		for field in fields
	}
	if not all(values.values()):
		return None
	try:
		validate_email(values["email"])
	except Exception:
		return None
	return values


def _cart_items(request):
	return [{
		"product_id": item.product.frontend_id or item.product.pk,
		"quantity": item.quantity,
		"size": item.size,
		"color": item.color,
    } for item in _cart(request).items.select_related("product")] 


def _resolve_order_lines(raw_items):
	if not isinstance(raw_items, list) or not raw_items:
		raise CheckoutValidationError("Order must contain at least one item.")

	order_lines = []
	subtotal = Decimal("0")
	for raw_item in raw_items:
		if not isinstance(raw_item, dict):
			raise CheckoutValidationError("Each order item must be an object.")
		try:
			product = _product_by_id(raw_item.get("product_id", raw_item.get("id")))
		except (TypeError, ValueError):
			product = None
		if product is None:
			raise CheckoutValidationError("One or more products were not found.", 404)
		product = Product.objects.select_for_update().get(pk=product.pk)
		try:
			quantity = int(raw_item.get("quantity", 1))
		except (TypeError, ValueError):
			raise CheckoutValidationError("Quantity must be a positive integer.")
		if quantity < 1:
			raise CheckoutValidationError("Quantity must be a positive integer.")
		if quantity > product.stock_quantity:
			raise CheckoutValidationError(f"Requested quantity exceeds stock for {product.name}.")
		subtotal += product.price * quantity
		order_lines.append((product, quantity, str(raw_item.get("size", "")), str(raw_item.get("color", ""))))

	return order_lines, _money(subtotal)


def _calculate_totals(data, subtotal):
	try:
		shipping = _money(Decimal(str(data.get("shipping", 0))))
	except (InvalidOperation, TypeError, ValueError):
		raise CheckoutValidationError("Shipping must be a valid amount.")
	if shipping not in SHIPPING_RATES:
		raise CheckoutValidationError("Select a valid shipping option.")

	coupon_code = str(data.get("coupon_code", "")).strip().upper()
	if coupon_code and coupon_code not in COUPON_DISCOUNTS:
		raise CheckoutValidationError("The coupon code is not valid.")

	discount = _money(subtotal * COUPON_DISCOUNTS.get(coupon_code, Decimal("0")))
	tax = _money((subtotal - discount) * TAX_RATE)
	return {
		"subtotal": subtotal,
		"discount": discount,
		"shipping": shipping,
		"tax": tax,
		"total": _money(subtotal - discount + shipping + tax),
	}


def _fetch_razorpay_payment(payment_id):
	key_id = getattr(settings, "RAZORPAY_KEY_ID", "")
	key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "")
	if not key_id or not key_secret:
		raise RazorpayVerificationError("Razorpay credentials are not configured.")

	token = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()
	request_obj = urllib.request.Request(
		f"https://api.razorpay.com/v1/payments/{quote(payment_id, safe='')}",
		headers={"Authorization": f"Basic {token}"},
		method="GET",
	)
	try:
		with urllib.request.urlopen(request_obj, timeout=15) as response:
			payment = json.loads(response.read())
	except (URLError, TimeoutError, ValueError) as error:
		raise RazorpayVerificationError("Unable to confirm the Razorpay payment.") from error
	if not isinstance(payment, dict):
		raise RazorpayVerificationError("Razorpay returned an invalid payment response.")
	return payment


def _payment_is_confirmed(payment, gateway_order_id, amount=None):
	return (
		payment.get("order_id") == gateway_order_id
		and payment.get("status") == "captured"
		and payment.get("captured") is True
		and payment.get("currency") == "INR"
		and (amount is None or payment.get("amount") == amount)
	)


@require_http_methods(["GET"])
def payment_csrf_api(request):
	return JsonResponse({"csrf_token": get_token(request)})


@require_http_methods(["POST"])
def razorpay_order_api(request):
	if not getattr(settings, "RAZORPAY_KEY_ID", "") or not getattr(settings, "RAZORPAY_KEY_SECRET", ""):
		return JsonResponse({"detail": "Online payment is not configured. Add Razorpay test credentials to the server environment."}, status=503)
	data = _request_data(request)
	if data is None:
		return JsonResponse({"detail": "Request body must be valid JSON."}, status=400)
	try:
		_, subtotal = _resolve_order_lines(data.get("items"))
		totals = _calculate_totals(data, subtotal)
	except CheckoutValidationError as error:
		return JsonResponse({"detail": error.detail}, status=error.status)
	amount = int(totals["total"] * 100)
	if amount <= 0:
		return JsonResponse({"detail": "The order total must be greater than zero."}, status=400)
	payload = json.dumps({"amount": amount, "currency": "INR", "receipt": str(data.get("receipt", "fashion-order"))[:40]}).encode()
	token = base64.b64encode(f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode()).decode()
	request_obj = urllib.request.Request("https://api.razorpay.com/v1/orders", data=payload, headers={"Content-Type": "application/json", "Authorization": f"Basic {token}"}, method="POST")
	try:
		with urllib.request.urlopen(request_obj, timeout=15) as response:
			result = json.loads(response.read())
			result["key_id"] = settings.RAZORPAY_KEY_ID
			return JsonResponse(result)
	except Exception:
		return JsonResponse({"detail": "Unable to create the online payment order."}, status=502)


@csrf_exempt
@require_http_methods(["POST"])
def razorpay_verify_api(request):
	data = _request_data(request) or {}
	order_id = str(data.get("razorpay_order_id", ""))
	payment_id = str(data.get("razorpay_payment_id", ""))
	signature = str(data.get("razorpay_signature", ""))
	if not getattr(settings, "RAZORPAY_KEY_ID", "") or not getattr(settings, "RAZORPAY_KEY_SECRET", ""):
		return JsonResponse({"detail": "Online payment is not configured."}, status=503)
	if not order_id or not payment_id or not signature:
		return JsonResponse({"detail": "Incomplete payment verification data."}, status=400)
	expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), f"{order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
	if not hmac.compare_digest(expected, signature):
		return JsonResponse({"detail": "Payment verification failed."}, status=400)
	try:
		payment = _fetch_razorpay_payment(payment_id)
	except RazorpayVerificationError:
		return JsonResponse({"detail": "Unable to confirm the Razorpay payment."}, status=502)
	if not _payment_is_confirmed(payment, order_id):
		return JsonResponse({"detail": "Razorpay has not captured this payment for the supplied order."}, status=400)
	return JsonResponse({"verified": True, "razorpay_order_id": order_id, "razorpay_payment_id": payment_id})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def order_api(request):
	if request.method == "GET":
		orders = Order.objects.filter(user=request.user) if request.user.is_authenticated else Order.objects.none()
		return JsonResponse([_order_data(order) for order in orders.prefetch_related("items")], safe=False)

	data = _request_data(request)
	if data is None:
		return JsonResponse({"detail": "Request body must be valid JSON."}, status=400)

	customer = _customer(data)
	if customer is None:
		return JsonResponse({"detail": "Complete and valid customer details are required."}, status=400)

	raw_items = data.get("items")
	if raw_items is None:
		raw_items = _cart_items(request)
	try:
		order_lines, subtotal = _resolve_order_lines(raw_items)
		totals = _calculate_totals(data, subtotal)
	except CheckoutValidationError as error:
		return JsonResponse({"detail": error.detail}, status=error.status)
	payment_method = str(data.get("payment_method", "cod")).lower()
	payment_status = "pending"
	payment_id = str(data.get("razorpay_payment_id", ""))
	gateway_order_id = str(data.get("razorpay_order_id", ""))
	if payment_method == "online":
		signature = str(data.get("razorpay_signature", ""))
		if not getattr(settings, "RAZORPAY_KEY_ID", "") or not getattr(settings, "RAZORPAY_KEY_SECRET", ""):
			return JsonResponse({"detail": "Online payment is not configured."}, status=503)
		if not payment_id or not gateway_order_id or not signature:
			return JsonResponse({"detail": "Online payment must be completed before placing the order."}, status=400)
		expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), f"{gateway_order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
		if not hmac.compare_digest(expected, signature):
			return JsonResponse({"detail": "Payment verification failed; order was not placed."}, status=400)
		if Order.objects.filter(payment_id=payment_id).exists():
			return JsonResponse({"detail": "This payment has already been used for an order."}, status=409)
		try:
			payment = _fetch_razorpay_payment(payment_id)
		except RazorpayVerificationError:
			return JsonResponse({"detail": "Unable to confirm the Razorpay payment."}, status=502)
		if not _payment_is_confirmed(payment, gateway_order_id, int(totals["total"] * 100)):
			return JsonResponse({"detail": "Razorpay has not captured the full order amount."}, status=400)
		payment_status = "paid"

	try:
		with transaction.atomic():
			order = Order.objects.create(
				user=request.user if request.user.is_authenticated else None,
				name=customer["name"], email=customer["email"], phone=customer["phone"],
				address=customer["address"], city=customer["city"], state=customer["state"],
				postal_code=customer["postal_code"], payment_method=payment_method, payment_status=payment_status,
				payment_id=payment_id, gateway_order_id=gateway_order_id,
				subtotal=totals["subtotal"], discount=totals["discount"],
				shipping=totals["shipping"], tax=totals["tax"], total=totals["total"],
			)
			for product, quantity, size, color in order_lines:
				images = product.images if isinstance(product.images, list) else []
				OrderItem.objects.create(
					order=order, product=product, product_id_snapshot=product.frontend_id or product.pk,
					name=product.name, image=product.image or (images[0] if images else ""),
					quantity=quantity, price=product.price, size=size, color=color,
				)
				product.stock_quantity -= quantity
				product.save(update_fields=["stock_quantity"])
			_cart(request).items.all().delete()
	except IntegrityError:
		if payment_method == "online" and Order.objects.filter(payment_id=payment_id).exists():
			return JsonResponse({"detail": "This payment has already been used for an order."}, status=409)
		raise
	return JsonResponse(_order_data(order), status=201)
