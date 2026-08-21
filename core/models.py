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

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
