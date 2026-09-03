import json
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase

from .models import Brand, Category, Order, Product


class ProductApiTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Men")
        brand = Brand.objects.create(name="Test Brand")
        Product.objects.create(
            frontend_id=57,
            name="Test Product",
            category=category,
            brand=brand,
            price=299,
            old_price=599,
            discount=50,
            images=["pm1.png", "pm1.1.png", "pm1.2.png"],
            sizes=["S", "M"],
            stock_quantity=10,
            rating=4.1,
        )

    def test_product_list_returns_catalog_shape(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]["images"], [
            "/frontend/assets/image/pm1.png",
            "/frontend/assets/image/pm1.1.png",
            "/frontend/assets/image/pm1.2.png",
        ])

    def test_product_detail_uses_frontend_id_and_its_own_images(self):
        response = self.client.get("/api/products/57/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], 57)
        self.assertEqual(response.json()["images"][0], "/frontend/assets/image/pm1.png")

    def test_missing_product_returns_json_404(self):
        response = self.client.get("/api/products/999999/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Product not found."})

    def test_product_list_supports_search_filters_and_sorting(self):
        women = Category.objects.create(name="Women")
        women_brand = Brand.objects.create(name="Other Brand")
        Product.objects.create(
            frontend_id=58,
            name="Affordable Shirt",
            category=women,
            brand=women_brand,
            price=199,
            stock_quantity=0,
            description="A cotton shirt",
            rating=3.5,
        )
        Product.objects.create(
            frontend_id=59,
            name="Test Premium Shirt",
            category=women,
            brand=women_brand,
            price=499,
            stock_quantity=2,
            description="A premium shirt",
            rating=4.8,
        )
        Product.objects.create(
            frontend_id=60,
            name="Test Standard Shirt",
            category=women,
            brand=women_brand,
            price=399,
            stock_quantity=2,
            description="A standard shirt",
            rating=4.2,
        )

        response = self.client.get("/api/products/?search=Test&category=Women&in_stock=true&sort=price_desc")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [59, 60])

        response = self.client.get("/api/products/?min_price=300&max_price=300&min_rating=4")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [57])

    def test_product_list_rejects_invalid_numeric_filters(self):
        response = self.client.get("/api/products/?min_price=not-a-number")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"detail": "min_price must be a number."})


class BackendWorkflowTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Women")
        brand = Brand.objects.create(name="Test Brand")
        Product.objects.create(frontend_id=1, name="Existing Catalog Product", category=category, brand=brand, price=799, old_price=1499, images=["pw1.png", "pw1.1.png"], sizes=["S", "M"], stock_quantity=10)

    def post_json(self, url, data):
        return self.client.post(url, data=json.dumps(data), content_type="application/json")

    def test_anonymous_cart_and_wishlist_workflows(self):
        added = self.post_json("/api/cart/items/", {"product_id": 1, "quantity": 2, "size": "M"})
        self.assertEqual(added.status_code, 201)
        cart = self.client.get("/api/cart/").json()
        self.assertEqual(cart["item_count"], 2)
        item_id = cart["items"][0]["item_id"]
        updated = self.client.patch(f"/api/cart/items/{item_id}/", data=json.dumps({"quantity": 3}), content_type="application/json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["quantity"], 3)
        wished = self.post_json("/api/wishlist/items/", {"product_id": 1})
        self.assertEqual(wished.status_code, 201)
        self.assertEqual(self.client.get("/api/wishlist/").json()["items"][0]["id"], 1)
        self.assertEqual(self.client.delete("/api/wishlist/items/1/").status_code, 200)

    def test_authentication_and_order_workflow(self):
        registered = self.post_json("/api/auth/register/", {"name": "Test Shopper", "email": "shopper@example.com", "password": "StrongPass123!"})
        self.assertEqual(registered.status_code, 201)
        self.assertTrue(self.client.get("/api/auth/me/").json()["authenticated"])
        order = self.post_json("/api/orders/", {"customer": {"name": "Test Shopper", "email": "shopper@example.com", "phone": "9999999999", "address": "1 Main Road", "city": "Bhubaneswar", "state": "Odisha", "postal_code": "751001"}, "items": [{"product_id": 1, "quantity": 1, "size": "M"}], "payment_method": "cod", "shipping": 0, "tax": 0})
        self.assertEqual(order.status_code, 201)
        self.assertEqual(order.json()["status"], "placed")
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(len(self.client.get("/api/orders/").json()), 1)
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 200)

    @patch("core.management.commands.import_public_products.fetch_products")
    def test_public_import_is_additive_and_idempotent(self, fetch_products):
        fetch_products.return_value = [{"id": 999, "title": "Imported Dress", "description": "Imported description", "category": "womens-dresses", "price": 25, "discountPercentage": 20, "rating": 4.5, "stock": 4, "brand": "Public Brand", "images": ["https://example.com/dress.webp"]}]
        call_command("import_public_products")
        call_command("import_public_products")
        self.assertEqual(Product.objects.filter(source="manual").count(), 1)
        self.assertEqual(Product.objects.filter(source="dummyjson").count(), 1)
        imported = Product.objects.get(source="dummyjson")
        self.assertEqual(imported.frontend_id, 100999)
        self.assertEqual(imported.image, "https://example.com/dress.webp")
