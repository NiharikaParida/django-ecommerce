# Fashion Store

Django serves both the API and the static frontend. Running the site from Django
keeps browser requests, authentication cookies, checkout, and CSRF on one origin.
Do not open `frontend/index.html` with VS Code Live Server for checkout: its
relative `/api/...` requests would go to Live Server instead of Django.

## Fresh Windows setup

From PowerShell:

```powershell
git clone --branch checkout-rasmi https://github.com/NiharikaParida/django-ecommerce.git
Set-Location .\django-ecommerce

py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

$env:DJANGO_DEBUG = "true"
$env:DJANGO_SECRET_KEY = (python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
$env:DJANGO_ALLOWED_HOSTS = "127.0.0.1,localhost"

python manage.py check
python manage.py migrate
python manage.py seed_products
python manage.py createsuperuser
python manage.py runserver
```

Open <http://127.0.0.1:8000/>. The database is created locally by migrations;
`seed_products` inserts the 32 built-in products used by the frontend and is
safe to run again. The local SQLite database and backups are not needed in Git.
To test the app and checkout:

```powershell
python manage.py test
```

For production, set `DJANGO_DEBUG=false`, a private `DJANGO_SECRET_KEY`, and
`DJANGO_ALLOWED_HOSTS` to the actual host names. Production mode refuses to
start without the secret and at least one allowed host. `DJANGO_DB_PATH` can be
set to a different SQLite file path; otherwise the database is `db.sqlite3` in
the project directory.

## Optional Razorpay test mode

Online payments are disabled unless both server-side variables are set:

```powershell
$env:RAZORPAY_KEY_ID = "<Razorpay test key id>"
$env:RAZORPAY_KEY_SECRET = "<Razorpay test key secret>"
python manage.py runserver
```

Use test credentials only in local development. Never put these values in
frontend JavaScript or commit them. Cash on Delivery checkout does not require
Razorpay credentials. Before an online order is marked paid, Django verifies
the signature and confirms with Razorpay that the payment is captured, belongs
to the supplied gateway order, and matches the server-calculated total. Enable
automatic capture in the Razorpay account for this flow. The Razorpay order
amount is also calculated by Django from catalog item IDs and checkout rules;
the browser's amount is not trusted.

## Checkout API

- `GET /api/products/` returns the Django catalog.
- `GET /api/cart/` and `POST /api/cart/items/` read and update the server cart.
- `POST /api/orders/` validates products against the catalog and creates the
  order and order items transactionally. Product prices, the `FASHION20`
  discount, shipping options (`0`, `99`, or `199`), and tax are validated or
  calculated by Django rather than accepted from browser totals.
- `GET /api/orders/` lists orders for the authenticated user.
- `GET /api/profile/summary/` requires an authenticated user.
- Razorpay endpoints are under `/api/payments/razorpay/`; payment credentials
  are read only by Django.

Checkout uses the product IDs from the browser catalog. Seed the Django
catalog after migrations so those IDs resolve on the server. No Django REST
Framework serializers are configured in this project; the API currently uses
Django `JsonResponse` views.
