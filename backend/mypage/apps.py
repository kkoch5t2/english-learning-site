from django.apps import AppConfig


class MypageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mypage'

    def ready(self):
        from mypage.tasks.task import start_scheduler
        start_scheduler()