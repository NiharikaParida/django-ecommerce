import hashlib
import hmac
import json
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase
from django.test import override_settings

from core.models import Brand, Cart, Category, Order, Product


class OrderCreationTests(TestCase):
	def setUp(self):
		category = Category.objects.create(name="Women")
		brand = Brand.objects.create(name="Test Brand")
		self.product = Product.objects.create(
			frontend_id=42, name="Test Dress", category=category, brand=brand,
			price="100.00", discount=20, stock_quantity=5, image="dress.png",
		)
		self.customer = {
			"name": "Test Shopper", "email": "shopper@example.com", "phone": "9999999999",
			"address": "1 Main Road", "city": "Bhubaneswar", "state": "Odisha", "postal_code": "751001",
		}

	def post_order(self, payload):
		return self.client.post("/api/orders/", data=json.dumps(payload), content_type="application/json")

	def test_cart_is_converted_and_totals_are_calculated(self):
		self.client.post("/api/cart/items/", data=json.dumps({"product_id": 42, "quantity": 2}), content_type="application/json")
		response = self.post_order({
			"customer": self.customer,
			"coupon_code": "FASHION20",
			"discount": "999.00",
			"shipping": "99.00",
			"tax": "0.00",
		})

		self.assertEqual(response.status_code, 201)
		body = response.json()
		self.assertEqual(body["customer"]["email"], self.customer["email"])
		self.assertEqual(body["subtotal"], 200.0)
		self.assertEqual(body["discount"], 40.0)
		self.assertEqual(body["shipping"], 99.0)
		self.assertEqual(body["tax"], 9.6)
		self.assertEqual(body["total"], 268.6)
		self.assertEqual(Order.objects.count(), 1)
		self.assertEqual(Order.objects.get().items.count(), 1)
		self.assertFalse(Cart.objects.get().items.exists())
		self.product.refresh_from_db()
		self.assertEqual(self.product.stock_quantity, 3)

	def test_order_rejects_unknown_coupon_and_shipping_rate(self):
		payload = {
			"customer": self.customer,
			"items": [{"product_id": 42, "quantity": 1}],
			"coupon_code": "UNRECOGNIZED",
			"shipping": 0,
		}
		response = self.post_order(payload)
		self.assertEqual(response.status_code, 400)
		self.assertEqual(Order.objects.count(), 0)

		payload["coupon_code"] = ""
		payload["shipping"] = 10
		response = self.post_order(payload)
		self.assertEqual(response.status_code, 400)
		self.assertEqual(Order.objects.count(), 0)

	def test_order_is_rejected_when_quantity_exceeds_stock(self):
		response = self.post_order({"customer": self.customer, "items": [{"product_id": 42, "quantity": 6}]})
		self.assertEqual(response.status_code, 400)
		self.assertEqual(Order.objects.count(), 0)
		self.product.refresh_from_db()
		self.assertEqual(self.product.stock_quantity, 5)

	def test_invalid_items_do_not_create_order(self):
		response = self.post_order({"customer": self.customer, "items": [{"product_id": 9999, "quantity": 1}]})
		self.assertEqual(response.status_code, 404)
		self.assertEqual(Order.objects.count(), 0)

		response = self.post_order({"customer": self.customer, "items": ["bad-item"]})
		self.assertEqual(response.status_code, 400)
		self.assertEqual(Order.objects.count(), 0)

	@override_settings(RAZORPAY_KEY_ID="test-key", RAZORPAY_KEY_SECRET="test-secret")
	def test_online_order_rejects_invalid_payment_signature(self):
		response = self.post_order({
			"customer": self.customer,
			"items": [{"product_id": 42, "quantity": 1}],
			"payment_method": "online",
			"razorpay_order_id": "order_test",
			"razorpay_payment_id": "pay_test",
			"razorpay_signature": "invalid",
		})

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()["detail"], "Payment verification failed; order was not placed.")
		self.assertEqual(Order.objects.count(), 0)

	@override_settings(RAZORPAY_KEY_ID="test-key", RAZORPAY_KEY_SECRET="test-secret")
	def test_online_order_is_marked_paid_only_for_captured_full_amount(self):
		order_id = "order_test"
		payment_id = "pay_test"
		signature = hmac.new(
			b"test-secret",
			f"{order_id}|{payment_id}".encode(),
			hashlib.sha256,
		).hexdigest()

		with patch("checkout.views._fetch_razorpay_payment", return_value={
			"order_id": order_id, "status": "captured", "captured": True,
			"currency": "INR", "amount": 10600,
		}):
			response = self.post_order({
				"customer": self.customer,
				"items": [{"product_id": 42, "quantity": 1}],
				"payment_method": "online",
				"razorpay_order_id": order_id,
				"razorpay_payment_id": payment_id,
				"razorpay_signature": signature,
			})

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.json()["payment_status"], "paid")
		self.assertEqual(Order.objects.get().payment_id, payment_id)

	@override_settings(RAZORPAY_KEY_ID="test-key", RAZORPAY_KEY_SECRET="test-secret")
	def test_payment_verification_endpoint_checks_signature(self):
		order_id = "order_test"
		payment_id = "pay_test"
		signature = hmac.new(
			b"test-secret",
			f"{order_id}|{payment_id}".encode(),
			hashlib.sha256,
		).hexdigest()

		invalid = self.client.post(
			"/api/payments/razorpay/verify/",
			data=json.dumps({
				"razorpay_order_id": order_id,
				"razorpay_payment_id": payment_id,
				"razorpay_signature": "invalid",
			}),
			content_type="application/json",
		)
		self.assertEqual(invalid.status_code, 400)
		self.assertFalse(invalid.json().get("verified", False))

		with patch("checkout.views._fetch_razorpay_payment", return_value={
			"order_id": order_id, "status": "captured", "captured": True, "currency": "INR",
		}):
			valid = self.client.post(
				"/api/payments/razorpay/verify/",
				data=json.dumps({
					"razorpay_order_id": order_id,
					"razorpay_payment_id": payment_id,
					"razorpay_signature": signature,
				}),
				content_type="application/json",
			)
		self.assertEqual(valid.status_code, 200)
		self.assertTrue(valid.json()["verified"])

	@override_settings(RAZORPAY_KEY_ID="test-key", RAZORPAY_KEY_SECRET="test-secret")
	def test_authorized_or_underpaid_transaction_cannot_place_order(self):
		order_id = "order_test"
		payment_id = "pay_test"
		signature = hmac.new(
			b"test-secret",
			f"{order_id}|{payment_id}".encode(),
			hashlib.sha256,
		).hexdigest()

		with patch("checkout.views._fetch_razorpay_payment", return_value={
			"order_id": order_id, "status": "authorized", "captured": False,
			"currency": "INR", "amount": 100,
		}):
			response = self.post_order({
				"customer": self.customer,
				"items": [{"product_id": 42, "quantity": 1}],
				"payment_method": "online",
				"razorpay_order_id": order_id,
				"razorpay_payment_id": payment_id,
				"razorpay_signature": signature,
			})

		self.assertEqual(response.status_code, 400)
		self.assertEqual(Order.objects.count(), 0)
		self.product.refresh_from_db()
		self.assertEqual(self.product.stock_quantity, 5)

	@override_settings(RAZORPAY_KEY_ID="test-key", RAZORPAY_KEY_SECRET="test-secret")
	def test_payment_id_cannot_be_reused_for_another_order(self):
		order_id = "order_test"
		payment_id = "pay_test"
		signature = hmac.new(
			b"test-secret",
			f"{order_id}|{payment_id}".encode(),
			hashlib.sha256,
		).hexdigest()
		payload = {
			"customer": self.customer,
			"items": [{"product_id": 42, "quantity": 1}],
			"payment_method": "online",
			"razorpay_order_id": order_id,
			"razorpay_payment_id": payment_id,
			"razorpay_signature": signature,
		}

		with patch("checkout.views._fetch_razorpay_payment", return_value={
			"order_id": order_id, "status": "captured", "captured": True,
			"currency": "INR", "amount": 10600,
		}):
			first = self.post_order(payload)
			second = self.post_order(payload)

		self.assertEqual(first.status_code, 201)
		self.assertEqual(second.status_code, 409)
		self.assertEqual(Order.objects.count(), 1)

	@override_settings(RAZORPAY_KEY_ID="", RAZORPAY_KEY_SECRET="")
	def test_online_payment_requires_server_credentials(self):
		csrf = self.client.get("/api/payments/csrf/")
		self.assertEqual(csrf.status_code, 200)
		self.assertTrue(csrf.json()["csrf_token"])

		response = self.client.post(
			"/api/payments/razorpay/order/",
			data=json.dumps({"amount": 100}),
			content_type="application/json",
		)
		self.assertEqual(response.status_code, 503)
		self.assertIn("not configured", response.json()["detail"])

	@override_settings(RAZORPAY_KEY_ID="test-key", RAZORPAY_KEY_SECRET="test-secret")
	def test_razorpay_order_amount_is_calculated_from_catalog_and_checkout_rules(self):
		gateway_response = patch("checkout.views.urllib.request.urlopen")
		with gateway_response as urlopen:
			urlopen.return_value.__enter__.return_value.read.return_value = json.dumps({
				"id": "order_gateway",
				"amount": 26860,
				"currency": "INR",
			}).encode()
			response = self.client.post(
				"/api/payments/razorpay/order/",
				data=json.dumps({
					"items": [{"product_id": 42, "quantity": 2}],
					"coupon_code": "FASHION20",
					"shipping": 99,
					"amount": 1,
				}),
				content_type="application/json",
			)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()["amount"], 26860)
		request_data = json.loads(urlopen.call_args.args[0].data)
		self.assertEqual(request_data["amount"], 26860)


class FreshDatabaseCheckoutTests(TestCase):
	def test_seeded_catalog_supports_cart_to_order_workflow(self):
		call_command("seed_products")

		products = self.client.get("/api/products/")
		self.assertEqual(products.status_code, 200)
		self.assertEqual(len(products.json()), 32)
		self.assertIn(1, [product["id"] for product in products.json()])

		cart_response = self.client.post(
			"/api/cart/items/",
			data=json.dumps({"product_id": 1, "quantity": 2, "size": "M"}),
			content_type="application/json",
		)
		self.assertEqual(cart_response.status_code, 201)

		response = self.client.post(
			"/api/orders/",
			data=json.dumps({
				"customer": {
					"name": "Fresh Clone Shopper",
					"email": "fresh@example.com",
					"phone": "9999999999",
					"address": "1 Main Road",
					"city": "Bhubaneswar",
					"state": "Odisha",
					"postal_code": "751001",
				},
				"payment_method": "cod",
			}),
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 201)
		order = Order.objects.get(order_number=response.json()["order_number"])
		self.assertEqual(order.items.count(), 1)
		self.assertEqual(order.items.get().product.frontend_id, 1)
		self.assertEqual(order.items.get().quantity, 2)
		self.assertFalse(order.user_id)
		self.assertEqual(Product.objects.get(frontend_id=1).stock_quantity, 8)
		self.assertFalse(self.client.get("/api/cart/").json()["items"])
