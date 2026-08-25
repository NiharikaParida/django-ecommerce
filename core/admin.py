from django.contrib import admin
from .models import Brand, Cart, CartItem, Category, Order, OrderItem, Product, Wishlist, WishlistItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "brand", "category", "price", "stock_quantity", "rating", "review_count"]
    list_filter = ["category", "brand"]
    search_fields = ["name", "brand__name", "category__name"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "session_key", "updated_at"]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ["cart", "product", "quantity", "size", "color"]


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "session_key", "updated_at"]


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ["wishlist", "product", "created_at"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "email", "status", "total", "created_at"]
    list_filter = ["status", "payment_method"]
    search_fields = ["order_number", "email", "name"]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product_id_snapshot", "name", "quantity", "price"]
