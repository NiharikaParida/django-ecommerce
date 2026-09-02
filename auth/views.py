from django.contrib import messages
import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.db.models import Q
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

User = get_user_model()


def _request_data(request):
    try:
        return json.loads(request.body or '{}')
    except (TypeError, ValueError):
        return None


def _user_data(user):
    return {
        'id': user.id,
        'email': user.email,
        'name': user.get_full_name() or user.email,
    }


@csrf_exempt
@require_http_methods(['POST'])
def register_api(request):
    data = _request_data(request)
    if not isinstance(data, dict):
        return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)

    email = str(data.get('email', '')).strip().lower()
    password = data.get('password', '')
    name = str(data.get('name', '')).strip()
    if not email or not password:
        return JsonResponse({'detail': 'Email and password are required.'}, status=400)
    if User.objects.filter(Q(username__iexact=email) | Q(email__iexact=email)).exists():
        return JsonResponse({'detail': 'An account with this email already exists.'}, status=409)
    try:
        validate_password(password)
    except ValidationError as error:
        return JsonResponse({'detail': error.messages}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
    )
    login(request, user)
    return JsonResponse(_user_data(user), status=201)


@csrf_exempt
@require_http_methods(['POST'])
def login_api(request):
    data = _request_data(request)
    if not isinstance(data, dict):
        return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)

    identifier = str(data.get('email', '')).strip().lower()
    password = data.get('password', '')
    user = User.objects.filter(
        Q(username__iexact=identifier) | Q(email__iexact=identifier)
    ).first() if identifier else None
    authenticated_user = authenticate(
        request,
        username=user.username if user else identifier,
        password=password,
    )
    if authenticated_user is None:
        return JsonResponse({'detail': 'Invalid email or password.'}, status=401)

    login(request, authenticated_user)
    return JsonResponse(_user_data(authenticated_user))


@csrf_exempt
@require_http_methods(['POST'])
def logout_api(request):
    logout(request)
    return JsonResponse({'detail': 'Logged out.'})


def current_user_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})
    return JsonResponse({'authenticated': True, **_user_data(request.user)})

# Create your views here.

def HomePage(request):
    return render(request, 'pages/index.html')


def LoginPage(request):
    if request.method == 'POST':
        identifier = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        user = None
        if identifier and password:
            user_obj = User.objects.filter(
                Q(username__iexact=identifier) | Q(email__iexact=identifier)
            ).first()

            if user_obj is not None and user_obj.check_password(password):
                user = user_obj

        if user is not None:
            login(request, user)
            return redirect('home')

        messages.error(request, 'Invalid email or password.')

    return render(request, 'pages/login.html')

def RegisterPage(request):
    if request.method == 'POST':
        fullname = request.POST.get('fullname', '').strip()
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
        elif User.objects.filter(Q(username__iexact=email) | Q(email__iexact=email)).exists():
            messages.error(request, 'This email is already registered.')
        else:
            my_user = User.objects.create_user(username=email, email=email, password=password)
            login(request, my_user)
            return redirect('home')

    return render(request, 'pages/register.html')