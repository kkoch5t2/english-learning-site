from django.db import models
from mypage.models import CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator

QUIZ_TYPE_CHOICES = (
    ('Word', '単語'),
    ('Idiom', '熟語'),
    ('Sentence', '文章'),
    ('LongReading', '長文読解'),
)

QUIZ_LEVEL_CHOICES = (
    ('TOEIC_SCORE_300', 'TOEICスコア300レベル'),
    ('TOEIC_SCORE_600', 'TOEICスコア600レベル'),
    ('TOEIC_SCORE_900', 'TOEICスコア900レベル'),
)

# Create your models here.
class QuizResult(models.Model):
    completed_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    quiz_type = models.CharField(max_length=100, choices=QUIZ_TYPE_CHOICES)
    level = models.CharField(max_length=100, choices=QUIZ_LEVEL_CHOICES)
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])

    def __str__(self):
        return f'{self.user.username} - {self.quiz_type} - {self.level} - {self.score}'
