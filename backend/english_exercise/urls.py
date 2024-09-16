from django.urls import path
from . import views

urlpatterns = [
    path('word-quiz/', views.english_word_quiz, name='english_word_quiz'),
    path('idiom-quiz/', views.english_idiom_quiz, name='english_idiom_quiz'),
    path('sentence-quiz/', views.english_sentence_quiz, name='english_sentence_quiz'),
    path('long-reading-quiz/', views.english_long_reading_quiz, name='english_long_reading_quiz'),
    path('save-quiz-result/', views.save_quiz_result, name='save-quiz-result'),
    path('weekly-quiz-results/', views.get_weekly_quiz_results, name='get_weekly_quiz_results'),
    path('weekly-points/', views.get_weekly_points, name='get_weekly_points'),
    path('weekly-average-points/', views.get_weekly_average_points, name='get_weekly_average_points'),
    path('ranking/total-points/', views.get_weekly_total_points_ranking, name='total_points_ranking'),
    path('ranking/average-score/', views.get_weekly_average_score_ranking, name='average_score_ranking'),
    path('ranking/total-quiz-count/', views.get_weekly_total_quiz_count_ranking, name='total_quiz_count_ranking'),
]