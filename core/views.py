from django.http import JsonResponse
from .models import Brand, Category, Product


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
        "images": image_list,
        "sizes": product.sizes if isinstance(product.sizes, list) else [],
        "stock_quantity": product.stock_quantity,
    }


def product_list_api(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    products = Product.objects.select_related("category", "brand").all()
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
