"""
URL configuration for fashion_store project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.urls import path
from django.views.generic.base import RedirectView
from django.views.static import serve

from core import views as core_views

urlpatterns = [
    path('', RedirectView.as_view(url='/frontend/index.html', permanent=False), name='frontend-home'),
    path('admin/', admin.site.urls),
    path('api/products/', core_views.product_list_api, name='product-list-api'),
    path('api/products/<int:product_id>/', core_views.product_detail_api, name='product-detail-api'),
    path('api/categories/', core_views.category_list_api, name='category-list-api'),
    path('api/brands/', core_views.brand_list_api, name='brand-list-api'),
    path('api/cart/', core_views.cart_api, name='cart-api'),
    path('api/cart/items/', core_views.cart_item_create_api, name='cart-item-create-api'),
    path('api/cart/items/<int:item_id>/', core_views.cart_item_api, name='cart-item-api'),
    path('api/wishlist/', core_views.wishlist_api, name='wishlist-api'),
    path('api/wishlist/items/', core_views.wishlist_item_create_api, name='wishlist-item-create-api'),
    path('api/wishlist/items/<int:product_id>/', core_views.wishlist_item_api, name='wishlist-item-api'),
    path('api/orders/', core_views.order_api, name='order-api'),
    path('api/orders/<str:order_number>/', core_views.order_detail_api, name='order-detail-api'),
    path('api/auth/register/', core_views.register_api, name='auth-register-api'),
    path('api/auth/login/', core_views.login_api, name='auth-login-api'),
    path('api/auth/logout/', core_views.logout_api, name='auth-logout-api'),
    path('api/auth/me/', core_views.current_user_api, name='auth-me-api'),
]

if settings.DEBUG:
    urlpatterns.append(path('frontend/<path:path>', serve, {'document_root': settings.BASE_DIR / 'frontend'}))
