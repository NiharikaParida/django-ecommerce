import json
import base64
import hashlib
import hmac
import urllib.request
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.core.validators import validate_email
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.middleware.csrf import get_token

from core.models import Order, OrderItem, Product
from core.views import _cart, _order_data, _product_by_id


TAX_RATE = Decimal("0.06")
CENT = Decimal("0.01")


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


@require_http_methods(["GET"])
def payment_csrf_api(request):
	return JsonResponse({"csrf_token": get_token(request)})


@require_http_methods(["POST"])
def razorpay_order_api(request):
	if not getattr(settings, "RAZORPAY_KEY_ID", "") or not getattr(settings, "RAZORPAY_KEY_SECRET", ""):
		return JsonResponse({"detail": "Online payment is not configured. Add Razorpay test credentials to the server environment."}, status=503)
	data = _request_data(request) or {}
	try:
		amount = int(Decimal(str(data.get("amount", 0))) * 100)
		if amount <= 0: raise ValueError
	except (InvalidOperation, TypeError, ValueError):
		return JsonResponse({"detail": "A valid payment amount is required."}, status=400)
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
	if not order_id or not payment_id or not signature or not getattr(settings, "RAZORPAY_KEY_SECRET", ""):
		return JsonResponse({"detail": "Incomplete payment verification data."}, status=400)
	expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), f"{order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
	if not hmac.compare_digest(expected, signature):
		return JsonResponse({"detail": "Payment verification failed."}, status=400)
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
	if not isinstance(raw_items, list) or not raw_items:
		return JsonResponse({"detail": "Order must contain at least one item."}, status=400)

	order_lines = []
	subtotal = Decimal("0")
	for raw_item in raw_items:
		if not isinstance(raw_item, dict):
			return JsonResponse({"detail": "Each order item must be an object."}, status=400)
		try:
			product = _product_by_id(raw_item.get("product_id", raw_item.get("id")))
		except (TypeError, ValueError):
			product = None
		if product is None:
			return JsonResponse({"detail": "One or more products were not found."}, status=404)
		product = Product.objects.select_for_update().get(pk=product.pk)
		try:
			quantity = int(raw_item.get("quantity", 1))
		except (TypeError, ValueError):
			return JsonResponse({"detail": "Quantity must be a positive integer."}, status=400)
		if quantity < 1:
			return JsonResponse({"detail": "Quantity must be a positive integer."}, status=400)
		if quantity > product.stock_quantity:
			return JsonResponse({"detail": f"Requested quantity exceeds stock for {product.name}."}, status=400)
		subtotal += product.price * quantity
		order_lines.append((product, quantity, str(raw_item.get("size", "")), str(raw_item.get("color", ""))))

	subtotal = _money(subtotal)
	try:
		discount = _money(max(Decimal("0"), Decimal(str(data.get("discount", 0)))))
		shipping = _money(max(Decimal("0"), Decimal(str(data.get("shipping", 0)))))
		tax_input = data.get("tax")
		tax = _money(max(Decimal("0"), Decimal(str(tax_input)))) if tax_input is not None else _money((subtotal - discount) * TAX_RATE)
	except (InvalidOperation, TypeError, ValueError):
		return JsonResponse({"detail": "Order totals must be valid numbers."}, status=400)
	discount = min(discount, subtotal)
	total = _money(subtotal - discount + shipping + tax)
	payment_method = str(data.get("payment_method", "cod")).lower()
	payment_status = "pending"
	payment_id = str(data.get("razorpay_payment_id", ""))
	gateway_order_id = str(data.get("razorpay_order_id", ""))
	if payment_method == "online":
		signature = str(data.get("razorpay_signature", ""))
		if not payment_id or not gateway_order_id or not getattr(settings, "RAZORPAY_KEY_SECRET", ""):
			return JsonResponse({"detail": "Online payment must be completed before placing the order."}, status=400)
		expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), f"{gateway_order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
		if not hmac.compare_digest(expected, signature):
			return JsonResponse({"detail": "Payment verification failed; order was not placed."}, status=400)
		payment_status = "paid"

	with transaction.atomic():
		order = Order.objects.create(
			user=request.user if request.user.is_authenticated else None,
			name=customer["name"], email=customer["email"], phone=customer["phone"],
			address=customer["address"], city=customer["city"], state=customer["state"],
			postal_code=customer["postal_code"], payment_method=payment_method, payment_status=payment_status,
			payment_id=payment_id, gateway_order_id=gateway_order_id,
			subtotal=subtotal, discount=discount, shipping=shipping, tax=tax, total=total,
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
	return JsonResponse(_order_data(order), status=201)
