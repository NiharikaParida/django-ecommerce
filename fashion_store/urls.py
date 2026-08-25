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
from django.views.static import serve

from core import views as core_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', core_views.product_list_api, name='product-list-api'),
    path('api/products/<int:product_id>/', core_views.product_detail_api, name='product-detail-api'),
    path('api/categories/', core_views.category_list_api, name='category-list-api'),
    path('api/brands/', core_views.brand_list_api, name='brand-list-api'),
]

if settings.DEBUG:
    urlpatterns.append(path('frontend/<path:path>', serve, {'document_root': settings.BASE_DIR / 'frontend'}))
