import json
from decimal import Decimal, InvalidOperation
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand, CommandError

from core.models import Brand, Category, Product


SOURCE = "dummyjson"
SOURCE_URL = "https://dummyjson.com/products?limit=0"
ID_OFFSET = 100000

FASHION_CATEGORIES = {
    "womens-dresses": "Women",
    "womens-shoes": "Women",
    "womens-bags": "Women",
    "womens-jewellery": "Women",
    "womens-watches": "Women",
    "tops": "Women",
    "mens-shirts": "Men",
    "mens-shoes": "Men",
    "mens-watches": "Men",
}


def fetch_products(url):
    request = Request(url, headers={"Accept": "application/json", "User-Agent": "fashion-store-catalog-import/1.0"})
    with urlopen(request, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if isinstance(payload, dict):
        return payload.get("products", [])
    if isinstance(payload, list):
        return payload
    raise ValueError("The public API returned an unexpected response shape.")


def money(value):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal("0")


class Command(BaseCommand):
    help = "Import fashion products from DummyJSON without modifying existing manual products."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=0, help="Maximum number of eligible products to import; 0 imports all eligible products.")
        parser.add_argument("--category", help="Import one upstream category, for example womens-dresses or mens-shirts.")
        parser.add_argument("--url", default=SOURCE_URL, help="Public products endpoint returning the documented DummyJSON shape.")
        parser.add_argument("--dry-run", action="store_true", help="Fetch and report products without writing to the database.")

    def handle(self, *args, **options):
        selected_category = options.get("category")
        if selected_category and selected_category not in FASHION_CATEGORIES:
            raise CommandError(f"Unsupported fashion category: {selected_category}")
        try:
            upstream_products = fetch_products(options["url"])
        except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as error:
            raise CommandError(f"Could not import public products: {error}") from error

        eligible = [item for item in upstream_products if item.get("category") in FASHION_CATEGORIES and (not selected_category or item.get("category") == selected_category)]
        if options["limit"] > 0:
            eligible = eligible[: options["limit"]]
        if options["dry_run"]:
            self.stdout.write(f"Found {len(eligible)} eligible public fashion products.")
            return

        imported = 0
        updated = 0
        skipped = 0
        for item in eligible:
            external_id = str(item.get("id", "")).strip()
            if not external_id or not item.get("title") or not item.get("images"):
                skipped += 1
                continue
            category_name = FASHION_CATEGORIES[item["category"]]
            category, _ = Category.objects.get_or_create(name=category_name)
            brand_name = str(item.get("brand") or "Public Catalog").strip()[:100]
            brand, _ = Brand.objects.get_or_create(name=brand_name)
            price = money(item.get("price"))
            discount_percentage = money(item.get("discountPercentage"))
            old_price = (price / (Decimal("1") - discount_percentage / Decimal("100"))).quantize(Decimal("0.01")) if 0 < discount_percentage < 100 else price
            image_urls = [str(image) for image in item.get("images", []) if str(image).startswith(("http://", "https://"))]
            if not image_urls:
                skipped += 1
                continue
            frontend_id = ID_OFFSET + int(external_id) if external_id.isdigit() else None
            defaults = {
                "frontend_id": frontend_id,
                "name": str(item["title"])[:200],
                "category": category,
                "brand": brand,
                "price": price,
                "old_price": old_price,
                "discount": round(float(discount_percentage)),
                "image": image_urls[0],
                "images": image_urls,
                "sizes": ["S", "M", "L", "XL"],
                "stock_quantity": max(0, int(item.get("stock", 0) or 0)),
                "description": str(item.get("description", "")),
                "rating": min(9.9, max(0, float(item.get("rating", 0) or 0))),
                "review_count": 0,
                "color": "",
                "source": SOURCE,
                "external_id": external_id,
            }
            product, created = Product.objects.update_or_create(source=SOURCE, external_id=external_id, defaults=defaults)
            imported += int(created)
            updated += int(not created)

        self.stdout.write(self.style.SUCCESS(f"Imported {imported} new products and updated {updated}; skipped {skipped}. Existing manual products were not modified."))
