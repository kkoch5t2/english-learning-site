from django.contrib import admin
from mypage.models import (
    CustomUser,
    UserActivateTokens,
)

admin.site.register(CustomUser)
admin.site.register(UserActivateTokens)