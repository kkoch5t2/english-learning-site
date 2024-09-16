from django.utils import timezone
from django.conf import settings
from datetime import datetime, date, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from mypage.models import CustomUser


def delete_users():
    qs = CustomUser.objects.filter(is_active=False)
    for user in qs:
        user_date_joined = user.date_joined + timedelta(days=1)
        if user_date_joined < timezone.localtime(timezone.now()):
            user.delete()

def start_scheduler():
    scheduler = BackgroundScheduler({'apscheduler.timezone': 'Asia/Tokyo'})
    scheduler.add_job(delete_users, 'interval', hours=1)
    scheduler.start()
