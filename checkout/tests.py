import json

from django.test import TestCase

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
		response = self.post_order({"customer": self.customer, "discount": "20.00", "shipping": "10.00"})

		self.assertEqual(response.status_code, 201)
		body = response.json()
		self.assertEqual(body["customer"]["email"], self.customer["email"])
		self.assertEqual(body["subtotal"], 200.0)
		self.assertEqual(body["discount"], 20.0)
		self.assertEqual(body["shipping"], 10.0)
		self.assertEqual(body["tax"], 10.8)
		self.assertEqual(body["total"], 200.8)
		self.assertEqual(Order.objects.count(), 1)
		self.assertEqual(Order.objects.get().items.count(), 1)
		self.assertFalse(Cart.objects.get().items.exists())
		self.product.refresh_from_db()
		self.assertEqual(self.product.stock_quantity, 3)

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
