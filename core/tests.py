from django.test import TestCase

from .models import Brand, Category, Product


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
