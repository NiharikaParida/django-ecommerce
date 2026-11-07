import uuid

from django.conf import settings
from django.db import models


class Category(models.Model):
    """A product group such as Women, Men, Kids, or New Arrivals."""

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Brand(models.Model):
    """The company or label that makes a product."""

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    """A sellable fashion item from the existing frontend catalog."""

    # This keeps the Django row connected to the current JavaScript product ID.
    frontend_id = models.PositiveIntegerField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.PositiveIntegerField(default=0, help_text="Discount percentage, for example 30.")
    image = models.CharField(max_length=255, blank=True, help_text="Main image path or URL.")
    images = models.JSONField(default=list, blank=True, help_text="Additional image paths or URLs.")
    sizes = models.JSONField(default=list, blank=True, help_text="Example: [\"S\", \"M\", \"L\", \"XL\"]")
    stock_quantity = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=50, default="manual")
    external_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        ordering = ["name"]
        constraints = [models.UniqueConstraint(fields=["source", "external_id"], name="unique_product_source_id")]

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="cart")
    session_key = models.CharField(max_length=40, null=True, blank=True, unique=True)
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=30, blank=True)
    color = models.CharField(max_length=100, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["cart", "product", "size", "color"], name="unique_cart_product_variant")]


class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="wishlist")
    session_key = models.CharField(max_length=40, null=True, blank=True, unique=True)
    updated_at = models.DateTimeField(auto_now=True)


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="wishlist_items")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["wishlist", "product"], name="unique_wishlist_product")]


def make_order_number():
    return f"ORD-{uuid.uuid4().hex[:10].upper()}"


class Order(models.Model):
    STATUS_CHOICES = [("placed", "Placed"), ("processing", "Processing"), ("shipped", "Shipped"), ("delivered", "Delivered"), ("cancelled", "Cancelled")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders")
    order_number = models.CharField(max_length=32, unique=True, default=make_order_number)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="placed")
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    payment_method = models.CharField(max_length=30, default="cod")
    payment_status = models.CharField(max_length=20, default="pending")
    payment_id = models.CharField(max_length=100, blank=True, default="")
    gateway_order_id = models.CharField(max_length=100, blank=True, default="")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL, related_name="order_items")
    product_id_snapshot = models.PositiveIntegerField()
    name = models.CharField(max_length=200)
    image = models.CharField(max_length=255, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=30, blank=True)
    color = models.CharField(max_length=100, blank=True)
