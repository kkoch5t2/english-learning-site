from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from datetime import datetime
from django.utils import timezone


class CustomUser(AbstractUser):
    nickname = models.CharField(max_length=100)
    change_email = models.EmailField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=False)
    REQUIRED_FIELDS = ["email","is_active"]

    def __str__(self):
        return self.username


class UserActivateTokensManager(models.Manager):
    def activate_user_by_token(self, activate_token):
        user_activate_token = self.filter(
            activate_token=activate_token,
            expired_at__gte=datetime.now()
        ).first()
        if hasattr(user_activate_token, 'user'):
            user = user_activate_token.user
            user.is_active = True
            user.save()
            return user


class UserActivateTokens(models.Model):
    token_id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    activate_token = models.UUIDField(default=uuid.uuid4)
    expired_at = models.DateTimeField()
    objects = UserActivateTokensManager()

    def is_valid(self):
        return self.expired_at > timezone.now()
