from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    LoginUser
    , CheckLoginAttempts
    , LogoutUser
    , UserProfile
    , PasswordResetView
    , PasswordResetConfirmView
    , DeleteUserView
    , get_csrf_token
    , register_user
    , activate_user
    , change_username
    , change_nickname
    , change_email
    , change_password
    , change_email_confirm
)

urlpatterns = [
    path('csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('register/', register_user, name='register'),
    path('activate/<uuid:activate_token>/', activate_user, name='activate_user'),
    path('login/', LoginUser.as_view(), name='login'),
    path('check-login-attempts/', CheckLoginAttempts.as_view(), name='check-login-attempts'),
    path('logout/', LogoutUser.as_view(), name='logout'),
    path('mypage/', UserProfile.as_view(), name='mypage'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('change-username/', change_username, name='change_username'),
    path('change-nickname/', change_nickname, name='change_nickname'),
    path('change-email/', change_email, name='change_email'),
    path('change-email-confirm/<uidb64>/<token>/', change_email_confirm, name='change_email_confirm'),
    path('change-password/', change_password, name='change_password'),
    path('delete-user/', DeleteUserView.as_view(), name='delete_user'),
]
