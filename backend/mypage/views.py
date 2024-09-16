from django.middleware.csrf import get_token
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.shortcuts import redirect, get_object_or_404
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from .models import CustomUser, UserActivateTokens
from .serializers import UserSerializer
import json
import os
import uuid
import re
from axes.helpers import get_client_ip_address
from axes.models import AccessAttempt

User = get_user_model()

frontend_url = os.environ.get("FRONTEND_URL")

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})


@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            nickname = data.get('nickname')
            email = data.get('email')
            password = data.get('password')
            
            if not username or not email or not password:
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            try:
                validate_password(password)
            except ValidationError as e:
                return JsonResponse({'error': str(e)}, status=400)
            
            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            
            if CustomUser.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already exists'}, status=400)
            
            user = CustomUser.objects.create_user(
                username=username, 
                nickname=nickname, 
                email=email, 
                password=password,
                is_active=False
            )
            
            token = uuid.uuid4()
            UserActivateTokens.objects.create(
                user=user,
                activate_token=token,
                expired_at=timezone.now() + timezone.timedelta(days=1)
            )
            message = render_to_string('text_file/activation_register.txt', {
                'username': user.username,
                'activate_token': token,
                'protcol': os.environ.get("PROTOCOL"),
                'domain': os.environ.get("DOMAIN")
            })
            send_mail(
                'Activate your account',
                message,
                os.environ.get("DEFAULT_FROM_EMAIL"),
                [user.email],
                fail_silently=False,
            )
            return JsonResponse({'message': 'User registered successfully! Please check your email to activate your account.'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)


def activate_user(request, activate_token):
    user = UserActivateTokens.objects.activate_user_by_token(activate_token)
    if user:
        return HttpResponseRedirect(f'{frontend_url}/login/?delete_session=true')


class UserProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class LoginUser(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not re.match(r'^[a-zA-Z0-9]+$', username):
            return Response({"message": "Username can only contain letters and numbers."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            request.session.cycle_key()
            token, created = Token.objects.get_or_create(user=user)
            return Response({"message": "Login successful", "token": token.key}, status=status.HTTP_200_OK)
        else:
            client_ip = get_client_ip_address(request)
            attempt = AccessAttempt.objects.filter(ip_address=client_ip).first()
            if attempt and attempt.failures_since_start >= settings.AXES_FAILURE_LIMIT:
                return Response({"message": "Too many login attempts. Please try again later."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            return Response({"message": "Authentication failed"}, status=status.HTTP_401_UNAUTHORIZED)


class CheckLoginAttempts(APIView):
    def get(self, request, *args, **kwargs):
        client_ip = get_client_ip_address(request)
        attempt = AccessAttempt.objects.filter(ip_address=client_ip).first()
        if attempt and attempt.failures_since_start >= settings.AXES_FAILURE_LIMIT:
            return Response({"message": "Too many login attempts. Please try again later."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        return Response({"message": "Login attempts are within the limit."}, status=status.HTTP_200_OK)


class LogoutUser(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()
        logout(request)
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
    

class PasswordResetView(APIView):
    def get(self, request, uidb64, token):
        return redirect(f'{frontend_url}/password-reset-confirm/{uidb64}/{token}/')

    def post(self, request):
        email = request.data.get('email')
        user = CustomUser.objects.filter(email=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.id))
            reset_link = f"{frontend_url}/password-reset-confirm/{uid}/{token}/"
            message = render_to_string('text_file/password_reset_mail.txt', {
                'reset_link': reset_link,
                'protcol': os.environ.get("PROTOCOL"),
                'domain': os.environ.get("DOMAIN"),
            })
            send_mail(
                'Password Reset Request',
                message,
                os.environ.get("DEFAULT_FROM_EMAIL"),
                [email],
                fail_silently=False,
            )
            return Response({'message': 'A password reset email has been sent.'})
        return None


class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        user_id = urlsafe_base64_decode(uidb64).decode()
        user = CustomUser.objects.get(id=user_id)
        if user and default_token_generator.check_token(user, token):
            new_password = request.data.get('password')
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password has been reset successfully.'})
        return Response({'error': 'Invalid token or user ID.'}, status=400)
    

def change_username(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        new_username = data.get('newUsername')
        request_user = data.get('user')
        if CustomUser.objects.filter(username=new_username).exists():
            return JsonResponse({'error': 'This username is already registered.'})
        user = CustomUser.objects.get(id=request_user['id'])
        user.username = new_username
        user.save()
        return JsonResponse({'message': 'Username has been changed'})
    return JsonResponse({'error': 'Invalid request'}, status=400)


def change_nickname(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        new_nickname = data.get('newNickname')
        request_user = data.get('user')
        user = CustomUser.objects.get(id=request_user['id'])
        user.nickname = new_nickname
        user.save()
        return JsonResponse({'message': 'Nickname has been changed'})
    return JsonResponse({'error': 'Invalid request'}, status=400)


def change_email(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_email = data.get('newEmail')
            request_user = data.get('user')
            
            if not new_email or not request_user:
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            if CustomUser.objects.filter(email=new_email).exists():
                return JsonResponse({'error': 'Email already exists'}, status=400)
            
            user = CustomUser.objects.get(id=request_user['id'])

            token = uuid.uuid4()
            UserActivateTokens.objects.create(
                user=user,
                activate_token=token,
                expired_at=timezone.now() + timezone.timedelta(days=1)
            )
            
            uidb64 = urlsafe_base64_encode(force_bytes(user.id))
            
            message = render_to_string('text_file/activation_change_email.txt', {
                'username': user.username,
                'token': token,
                'protcol': os.environ.get("PROTOCOL"),
                'domain': os.environ.get("DOMAIN"),
                'uidb64': uidb64,
            })
            send_mail(
                'Change your email',
                message,
                os.environ.get("DEFAULT_FROM_EMAIL"),
                [new_email],
                fail_silently=False,
            )
            user.change_email = new_email
            user.save()
            return JsonResponse({'message': 'Email change initiated successfully! Please check your new email to activate the change.'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
    return JsonResponse({'error': 'Invalid method'}, status=405)


def change_email_confirm(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = CustomUser.objects.get(id=uid)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        user = None

    if user is not None and user.change_email:
        try:
            activation_token = get_object_or_404(UserActivateTokens, user=user, activate_token=token)
            if activation_token.is_valid():
                user.email = user.change_email
                user.change_email = None
                user.save()
                activation_token.delete()
                return HttpResponseRedirect(f'{frontend_url}/login/?delete_session=true')
            else:
                return HttpResponse('The link is invalid.')
        except UserActivateTokens.DoesNotExist:
            return HttpResponse('The link is invalid.')
    else:
        return HttpResponse('The link is invalid.')


def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        new_password = data.get('newPassword')
        request_user = data.get('user')
        user = CustomUser.objects.get(id=request_user['id'])
        user.set_password(new_password)
        user.save()
        return JsonResponse({'message': 'Password has been changed'})
    return JsonResponse({'error': 'Invalid request'}, status=400)
