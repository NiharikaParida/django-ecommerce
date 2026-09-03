import json
from decimal import Decimal, InvalidOperation

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Brand, Cart, CartItem, Category, Order, OrderItem, Product, Wishlist, WishlistItem


def _image_url(path):
    """Return a path that works from both the API and static frontend pages."""
    if not path:
        return ""
    if path.startswith(("http://", "https://")):
        return path
    if path.startswith("/frontend/assets/image/"):
        return path
    return f"/frontend/assets/image/{path.rsplit('/', 1)[-1]}"


def _serialize_product(product):
    images = product.images if isinstance(product.images, list) else []
    image_list = [_image_url(image) for image in images if image]
    main_image = _image_url(product.image) if product.image else (image_list[0] if image_list else "")
    if main_image and not image_list:
        image_list = [main_image]
    return {
        "id": product.frontend_id or product.pk,
        "name": product.name,
        "brand": product.brand.name,
        "category": product.category.name,
        "rating": float(product.rating),
        "review_count": product.review_count,
        "color": product.color,
        "price": float(product.price),
        "old_price": float(product.old_price) if product.old_price is not None else None,
        "discount": product.discount,
        "description": product.description,
        "image": main_image,
        "images": image_list,
        "sizes": product.sizes if isinstance(product.sizes, list) else [],
        "stock_quantity": product.stock_quantity,
        "source": product.source,
        "external_id": product.external_id,
    }


def product_list_api(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    products = Product.objects.select_related("category", "brand").all()

    # Keep the response shape backward-compatible while allowing the catalog
    # page (or another client) to search, filter, and sort server-side.
    search = (request.GET.get("search") or request.GET.get("q") or "").strip()
    if search:
        from django.db.models import Q

        products = products.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(brand__name__icontains=search)
            | Q(category__name__icontains=search)
        )

    category = (request.GET.get("category") or "").strip()
    if category:
        products = products.filter(category__name__iexact=category)

    brand = (request.GET.get("brand") or "").strip()
    if brand:
        products = products.filter(brand__name__iexact=brand)

    for parameter, lookup in (("min_price", "price__gte"), ("max_price", "price__lte"), ("min_rating", "rating__gte")):
        value = request.GET.get(parameter)
        if value not in (None, ""):
            try:
                products = products.filter(**{lookup: Decimal(value)})
            except (InvalidOperation, TypeError, ValueError):
                return JsonResponse({"detail": f"{parameter} must be a number."}, status=400)

    in_stock = (request.GET.get("in_stock") or "").strip().lower()
    if in_stock in {"1", "true", "yes"}:
        products = products.filter(stock_quantity__gt=0)
    elif in_stock in {"0", "false", "no"}:
        products = products.filter(stock_quantity=0)

    sort = (request.GET.get("sort") or request.GET.get("ordering") or "").strip().lower()
    sort_fields = {
        "price_asc": "price",
        "price_desc": "-price",
        "name_asc": "name",
        "name_desc": "-name",
        "rating_asc": "rating",
        "rating_desc": "-rating",
        "newest": "-pk",
        "oldest": "pk",
        "price": "price",
        "-price": "-price",
        "name": "name",
        "-name": "-name",
        "rating": "rating",
        "-rating": "-rating",
        "id": "pk",
        "-id": "-pk",
    }
    if sort in sort_fields:
        products = products.order_by(sort_fields[sort])

    return JsonResponse([_serialize_product(product) for product in products], safe=False)


def product_detail_api(request, product_id):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    try:
        product = Product.objects.select_related("category", "brand").get(frontend_id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"detail": "Product not found."}, status=404)
    return JsonResponse(_serialize_product(product))


def category_list_api(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    return JsonResponse(list(Category.objects.values("id", "name")), safe=False)


def brand_list_api(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    return JsonResponse(list(Brand.objects.values("id", "name")), safe=False)


def _body(request):
    try:
        return json.loads(request.body or "{}")
    except (TypeError, ValueError):
        return None


def _product_by_id(product_id):
    return Product.objects.select_related("category", "brand").filter(frontend_id=product_id).first() or Product.objects.select_related("category", "brand").filter(pk=product_id).first()


def _owner_key(request):
    if request.user.is_authenticated:
        return {"user": request.user, "session_key": None}
    if not request.session.session_key:
        request.session.create()
    return {"user": None, "session_key": request.session.session_key}


def _cart(request):
    key = _owner_key(request)
    return Cart.objects.get_or_create(**key)[0]


def _wishlist(request):
    key = _owner_key(request)
    return Wishlist.objects.get_or_create(**key)[0]


def _serialize_cart_item(item):
    product = _serialize_product(item.product)
    product.update({"item_id": item.id, "quantity": item.quantity, "size": item.size, "color": item.color, "line_total": float(item.product.price * item.quantity)})
    return product


def cart_api(request):
    cart = _cart(request)
    if request.method == "GET":
        items = [_serialize_cart_item(item) for item in cart.items.select_related("product__category", "product__brand")]
        return JsonResponse({"id": cart.id, "items": items, "item_count": sum(item["quantity"] for item in items)})
    if request.method == "DELETE":
        cart.items.all().delete()
        return JsonResponse({"detail": "Cart cleared.", "items": [], "item_count": 0})
    return JsonResponse({"detail": "Method not allowed."}, status=405)


@csrf_exempt
@require_http_methods(["POST"])
def cart_item_create_api(request):
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"detail": "Request body must be valid JSON."}, status=400)
    product = _product_by_id(data.get("product_id", data.get("id")))
    if not product:
        return JsonResponse({"detail": "Product not found."}, status=404)
    try:
        quantity = max(1, int(data.get("quantity", 1)))
    except (TypeError, ValueError):
        return JsonResponse({"detail": "Quantity must be a positive integer."}, status=400)
    if product.stock_quantity and quantity > product.stock_quantity:
        return JsonResponse({"detail": "Requested quantity exceeds available stock."}, status=400)
    item, created = CartItem.objects.get_or_create(cart=_cart(request), product=product, size=str(data.get("size", "")), color=str(data.get("color", "")))
    item.quantity = quantity if created else item.quantity + quantity
    if product.stock_quantity:
        item.quantity = min(item.quantity, product.stock_quantity)
    item.save(update_fields=["quantity"])
    return JsonResponse(_serialize_cart_item(item), status=201 if created else 200)


@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
def cart_item_api(request, item_id):
    item = _cart(request).items.select_related("product__category", "product__brand").filter(pk=item_id).first()
    if not item:
        return JsonResponse({"detail": "Cart item not found."}, status=404)
    if request.method == "DELETE":
        item.delete()
        return JsonResponse({"detail": "Cart item removed."})
    data = _body(request)
    try:
        quantity = int(data.get("quantity", 0))
    except (AttributeError, TypeError, ValueError):
        quantity = 0
    if quantity < 1:
        return JsonResponse({"detail": "Quantity must be at least 1."}, status=400)
    if item.product.stock_quantity:
        quantity = min(quantity, item.product.stock_quantity)
    item.quantity = quantity
    item.save(update_fields=["quantity"])
    return JsonResponse(_serialize_cart_item(item))


def wishlist_api(request):
    wishlist = _wishlist(request)
    if request.method == "GET":
        return JsonResponse({"items": [_serialize_product(item.product) for item in wishlist.items.select_related("product__category", "product__brand")]})
    return JsonResponse({"detail": "Method not allowed."}, status=405)


def profile_summary_api(request):
    """Return activity counts for the currently authenticated user only."""
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False}, status=401)
    cart = _cart(request)
    wishlist = _wishlist(request)
    orders = Order.objects.filter(user=request.user)
    return JsonResponse({
        "authenticated": True,
        "cart_count": sum(item.quantity for item in cart.items.all()),
        "wishlist_count": wishlist.items.count(),
        "order_count": orders.count(),
        "payment_statuses": list(orders.values("order_number", "payment_method", "status")),
    })


@csrf_exempt
@require_http_methods(["POST"])
def wishlist_item_create_api(request):
    data = _body(request)
    product = _product_by_id(data.get("product_id", data.get("id"))) if isinstance(data, dict) else None
    if not product:
        return JsonResponse({"detail": "Product not found."}, status=404)
    item, created = WishlistItem.objects.get_or_create(wishlist=_wishlist(request), product=product)
    return JsonResponse(_serialize_product(product), status=201 if created else 200)


@csrf_exempt
@require_http_methods(["DELETE"])
def wishlist_item_api(request, product_id):
    item = _wishlist(request).items.filter(product__frontend_id=product_id).first()
    if not item:
        return JsonResponse({"detail": "Wishlist item not found."}, status=404)
    item.delete()
    return JsonResponse({"detail": "Wishlist item removed."})


def _order_item(item):
    return {"product_id": item.product_id_snapshot, "name": item.name, "image": _image_url(item.image), "quantity": item.quantity, "price": float(item.price), "size": item.size, "color": item.color}


def _order_data(order):
    return {"id": order.order_number, "order_number": order.order_number, "status": order.status, "customer": {"name": order.name, "email": order.email, "phone": order.phone, "address": order.address, "city": order.city, "state": order.state, "postal_code": order.postal_code}, "payment_method": order.payment_method, "payment_status": order.payment_status, "payment_id": order.payment_id, "gateway_order_id": order.gateway_order_id, "subtotal": float(order.subtotal), "discount": float(order.discount), "shipping": float(order.shipping), "tax": float(order.tax), "total": float(order.total), "created_at": order.created_at.isoformat(), "items": [_order_item(item) for item in order.items.all()]}


@csrf_exempt
@require_http_methods(["GET", "POST"])
def order_api(request):
    if request.method == "GET":
        orders = Order.objects.filter(user=request.user) if request.user.is_authenticated else Order.objects.none()
        return JsonResponse([_order_data(order) for order in orders.prefetch_related("items")], safe=False)
    data = _body(request)
    customer = data.get("customer", data) if isinstance(data, dict) else {}
    raw_items = data.get("items") if isinstance(data, dict) else None
    if not raw_items and request.user.is_authenticated:
        raw_items = [{"product_id": item.product.frontend_id or item.product.pk, "quantity": item.quantity, "size": item.size, "color": item.color} for item in _cart(request).items.select_related("product")]
    if not raw_items:
        return JsonResponse({"detail": "Order must contain at least one item."}, status=400)
    order_lines = []
    subtotal = Decimal("0")
    for raw in raw_items:
        product = _product_by_id(raw.get("product_id", raw.get("id"))) if isinstance(raw, dict) else None
        if not product:
            return JsonResponse({"detail": "One or more products were not found."}, status=404)
        try:
            quantity = max(1, int(raw.get("quantity", 1)))
        except (TypeError, ValueError):
            return JsonResponse({"detail": "Quantity must be a positive integer."}, status=400)
        if product.stock_quantity and quantity > product.stock_quantity:
            return JsonResponse({"detail": f"Requested quantity exceeds stock for {product.name}."}, status=400)
        subtotal += product.price * quantity
        order_lines.append((product, quantity, str(raw.get("size", "")), str(raw.get("color", ""))))
    try:
        discount = max(Decimal("0"), Decimal(str(data.get("discount", 0))))
        shipping = max(Decimal("0"), Decimal(str(data.get("shipping", 0))))
        tax = max(Decimal("0"), Decimal(str(data.get("tax", 0))))
    except (InvalidOperation, TypeError, ValueError):
        return JsonResponse({"detail": "Order totals must be valid numbers."}, status=400)
    required = [customer.get(field) for field in ("name", "email", "phone", "address", "city", "state", "postal_code")]
    if not all(required):
        return JsonResponse({"detail": "Complete customer and delivery details are required."}, status=400)
    with transaction.atomic():
        order = Order.objects.create(user=request.user if request.user.is_authenticated else None, name=customer["name"], email=customer["email"], phone=customer["phone"], address=customer["address"], city=customer["city"], state=customer["state"], postal_code=customer["postal_code"], payment_method=data.get("payment_method", "cod"), subtotal=subtotal, discount=discount, shipping=shipping, tax=tax, total=max(Decimal("0"), subtotal - discount + shipping + tax))
        for product, quantity, size, color in order_lines:
            OrderItem.objects.create(order=order, product=product, product_id_snapshot=product.frontend_id or product.pk, name=product.name, image=product.image or (product.images[0] if product.images else ""), quantity=quantity, price=product.price, size=size, color=color)
    if request.user.is_authenticated:
        _cart(request).items.all().delete()
    return JsonResponse(_order_data(order), status=201)


def order_detail_api(request, order_number):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    query = Order.objects.prefetch_related("items").filter(order_number=order_number)
    if request.user.is_authenticated:
        query = query.filter(user=request.user)
    else:
        query = query.none()
    order = query.first()
    return JsonResponse(_order_data(order)) if order else JsonResponse({"detail": "Order not found."}, status=404)


User = get_user_model()


@csrf_exempt
@require_http_methods(["POST"])
def register_api(request):
    data = _body(request)
    if not isinstance(data, dict) or not data.get("email") or not data.get("password"):
        return JsonResponse({"detail": "Email and password are required."}, status=400)
    email = str(data["email"]).strip().lower()
    if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
        return JsonResponse({"detail": "An account with this email already exists."}, status=409)
    user = User.objects.create_user(username=email, email=email, password=data["password"], first_name=str(data.get("name", "")).strip())
    login(request, user)
    return JsonResponse({"id": user.id, "email": user.email, "name": user.get_full_name() or user.email}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login_api(request):
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"detail": "Request body must be valid JSON."}, status=400)
    email = str(data.get("email", "")).strip().lower()
    user = authenticate(request, username=email, password=data.get("password", ""))
    if not user:
        return JsonResponse({"detail": "Invalid email or password."}, status=401)
    login(request, user)
    return JsonResponse({"id": user.id, "email": user.email, "name": user.get_full_name() or user.email})


@csrf_exempt
@require_http_methods(["POST"])
def logout_api(request):
    logout(request)
    return JsonResponse({"detail": "Logged out."})


def current_user_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False})
    return JsonResponse({"authenticated": True, "id": request.user.id, "email": request.user.email, "name": request.user.get_full_name() or request.user.email})
