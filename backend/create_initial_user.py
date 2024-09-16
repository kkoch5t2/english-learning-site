import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

User = get_user_model()

if not User.objects.filter(username=os.environ.get("SUPER_USER_NAME")).exists():
    user = User.objects.create_superuser(os.environ.get("SUPER_USER_NAME"), os.environ.get("SUPER_USER_MAIL"), os.environ.get("SUPER_USER_PASSWORD"))
    user.is_active = True
    user.save()
    print("Superuser created.")
else:
    print("Superuser already exists.")
