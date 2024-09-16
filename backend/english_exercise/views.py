from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from datetime import datetime, timedelta
from mypage.models import CustomUser
from .models import QuizResult
import json
import os
import pytz
import random


def save_quiz_result(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = data.get('user') 
            quiz_type = data.get('quiz_type')
            level = data.get('level')
            score = data.get('score')
            
            if not user or not quiz_type or not level or score is None:
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            try:
                user = CustomUser.objects.get(username=user)
            except CustomUser.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            quiz_result = QuizResult(
                user=user,
                quiz_type=quiz_type,
                level=level,
                score=score
            )
            quiz_result.save()
            
            return JsonResponse({'message': 'Quiz result saved successfully'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)


def get_weekly_quiz_results(request):
    try:
        user_id = request.GET.get('user_id')
        quiz_type = request.GET.get('quiz_type')
        local_timezone = pytz.timezone('Asia/Tokyo')
        today = timezone.now().astimezone(local_timezone).replace(hour=0, minute=0, second=0, microsecond=0)
        one_week_ago = today - timedelta(days=6)
        results = []
        
        for i in range(7):
            date = one_week_ago + timedelta(days=i)
            next_day = date + timedelta(days=1)
            quiz_results = QuizResult.objects.filter(
                user_id=user_id, 
                quiz_type=quiz_type, 
                completed_at__gte=date.astimezone(pytz.utc), 
                completed_at__lt=next_day.astimezone(pytz.utc)
            )
            day_results = {
                'date': date.strftime('%Y-%m-%d'),
                'results': [{'user': result.user.username, 'quiz_type': result.quiz_type, 'level': result.level, 'score': result.score, 'completed_at': result.completed_at.astimezone(local_timezone)} for result in quiz_results]
            }
            results.append(day_results)
        
        return JsonResponse(results, safe=False)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_weekly_points(request):
    try:
        user_id = request.GET.get('user_id')
        quiz_type = request.GET.get('quiz_type')
        local_timezone = pytz.timezone('Asia/Tokyo')
        today = timezone.now().astimezone(local_timezone).replace(hour=0, minute=0, second=0, microsecond=0)
        one_week_ago = today - timedelta(days=6)
        points = {}
        for i in range(7):
            date = one_week_ago + timedelta(days=i)
            next_day = date + timedelta(days=1)
            daily_points = QuizResult.objects.filter(
                user_id=user_id, 
                quiz_type=quiz_type, 
                completed_at__gte=date.astimezone(pytz.utc), 
                completed_at__lt=next_day.astimezone(pytz.utc)
            ).aggregate(total_points=Sum('score'))['total_points']
            points[date.strftime('%Y-%m-%d')] = daily_points or 0
        return JsonResponse(points, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_weekly_average_points(request):
    try:
        user_id = request.GET.get('user_id')
        quiz_type = request.GET.get('quiz_type')
        local_timezone = pytz.timezone('Asia/Tokyo')
        today = timezone.now().astimezone(local_timezone).replace(hour=0, minute=0, second=0, microsecond=0)
        one_week_ago = today - timedelta(days=6)
        averages = {}
        for i in range(7):
            date = one_week_ago + timedelta(days=i)
            next_day = date + timedelta(days=1)
            daily_average = QuizResult.objects.filter(
                user_id=user_id, 
                quiz_type=quiz_type, 
                completed_at__gte=date.astimezone(pytz.utc), 
                completed_at__lt=next_day.astimezone(pytz.utc)
            ).aggregate(average_score=Avg('score'))['average_score']
            averages[date.strftime('%Y-%m-%d')] = daily_average or 0
        return JsonResponse(averages, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def english_word_quiz(request):
    try:
        if request.method == 'POST':
            body = json.loads(request.body)
            level = body.get('level')
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            if level == 'TOEIC_SCORE_300':
                english_word_quiz_file = os.path.join(base_dir, 'english_exercise/english_word_quiz/toeic_score_300_level_word.json')
            elif level == 'TOEIC_SCORE_600':
                english_word_quiz_file = os.path.join(base_dir, 'english_exercise/english_word_quiz/toeic_score_600_level_word.json')
            elif level == 'TOEIC_SCORE_900':
                english_word_quiz_file = os.path.join(base_dir, 'english_exercise/english_word_quiz/toeic_score_900_level_word.json')
            else:
                return JsonResponse({"error": "予期せぬ値：" + level}, status=400)
            
            with open(english_word_quiz_file, "r", encoding="utf-8") as file:
                data = json.load(file)
            
            if level not in data:
                return JsonResponse({"error": "指定されたレベルのデータが存在しません"}, status=400)

            questions = data[level]

            unique_questions = list({json.dumps(q, sort_keys=True) for q in questions})
            unique_questions = [json.loads(q) for q in unique_questions]
            
            if len(unique_questions) < 10:
                return JsonResponse({"error": "データの数が10未満です"}, status=400)

            random_objects = random.sample(unique_questions, 10)
            return JsonResponse(random_objects, safe=False)
        else:
            return JsonResponse({"error": "POSTリクエストのみ受け付けます"}, status=405)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": "Something went wrong"}, status=500)


def english_idiom_quiz(request):
    try:
        if request.method == 'POST':
            body = json.loads(request.body)
            level = body.get('level')
            
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            if level == 'TOEIC_SCORE_300':
                english_idiom_quiz_file = os.path.join(base_dir, 'english_exercise/english_idiom_quiz/toeic_score_300_level_idiom.json')
            elif level == 'TOEIC_SCORE_600':
                english_idiom_quiz_file = os.path.join(base_dir, 'english_exercise/english_idiom_quiz/toeic_score_600_level_idiom.json')
            elif level == 'TOEIC_SCORE_900':
                english_idiom_quiz_file = os.path.join(base_dir, 'english_exercise/english_idiom_quiz/toeic_score_900_level_idiom.json')
            else:
                return JsonResponse({"error": "予期せぬ値：" + level}, status=400)
            
            with open(english_idiom_quiz_file, "r", encoding="utf-8") as file:
                data = json.load(file)
        
            if level not in data:
                return JsonResponse({"error": "指定されたレベルのデータが存在しません"}, status=400)

            questions = data[level]
                
            unique_questions = list({json.dumps(q, sort_keys=True) for q in questions})
            unique_questions = [json.loads(q) for q in unique_questions]
            
            if len(unique_questions) < 10:
                return JsonResponse({"error": "データの数が10未満です"}, status=400)

            random_objects = random.sample(unique_questions, 10)
            return JsonResponse(random_objects, safe=False)
        else:
            return JsonResponse({"error": "POSTリクエストのみ受け付けます"}, status=405)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": "Something went wrong"}, status=500)


def english_sentence_quiz(request):
    try:
        if request.method == 'POST':
            body = json.loads(request.body)
            level = body.get('level')
            
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            if level == 'TOEIC_SCORE_300':
                english_sentence_quiz_file = os.path.join(base_dir, 'english_exercise/english_sentence_quiz/toeic_score_300_level_sentence.json')
            elif level == 'TOEIC_SCORE_600':
                english_sentence_quiz_file = os.path.join(base_dir, 'english_exercise/english_sentence_quiz/toeic_score_600_level_sentence.json')
            elif level == 'TOEIC_SCORE_900':
                english_sentence_quiz_file = os.path.join(base_dir, 'english_exercise/english_sentence_quiz/toeic_score_900_level_sentence.json')
            else:
                return JsonResponse({"error": "予期せぬ値：" + level}, status=400)
            
            with open(english_sentence_quiz_file, "r", encoding="utf-8") as file:
                data = json.load(file)

            if level not in data:
                return JsonResponse({"error": "指定されたレベルのデータが存在しません"}, status=400)
        
            questions = data[level]
                
            unique_questions = list({json.dumps(q, sort_keys=True) for q in questions})
            unique_questions = [json.loads(q) for q in unique_questions]
            
            if len(unique_questions) < 10:
                return JsonResponse({"error": "データの数が10未満です"}, status=400)

            random_objects = random.sample(unique_questions, 10)
            return JsonResponse(random_objects, safe=False)
        else:
            return JsonResponse({"error": "POSTリクエストのみ受け付けます"}, status=405)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": "Something went wrong"}, status=500)


def english_long_reading_quiz(request):
    try:
        if request.method == 'POST':
            body = json.loads(request.body)
            level = body.get('level')
            
            base_dir = os.path.dirname(os.path.abspath(__file__))
            
            if level == '300':
                file_path = os.path.join(base_dir, 'english_long_reading_quiz/toeic_score_300_level_long_reading.json')
            elif level == '600':
                file_path = os.path.join(base_dir, 'english_long_reading_quiz/toeic_score_600_level_long_reading.json')
            elif level == '900':
                file_path = os.path.join(base_dir, 'english_long_reading_quiz/toeic_score_900_level_long_reading.json')
            else:
                return JsonResponse({'error': 'Invalid level'}, status=400)

            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    quiz_data = json.load(file)
                return JsonResponse(quiz_data, safe=False)
            except FileNotFoundError:
                return JsonResponse({'error': 'Quiz data not found'}, status=404)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Error decoding JSON'}, status=500)
            except Exception as e:
                return JsonResponse({'error': 'Internal server error'}, status=500)
        else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'Internal server error'}, status=500)


def get_weekly_total_points_ranking(request):
    quiz_type = request.GET.get('quiz_type')
    local_timezone = pytz.timezone('Asia/Tokyo')

    # 現在の日時を取得
    now = datetime.now().astimezone(local_timezone)
    # 現在の曜日を取得（0:月曜日, 1:火曜日, ..., 6:日曜日）
    current_weekday = now.weekday()
    
    # 今週の日曜日の0時を求める
    if current_weekday == 6:
        start_of_week = now.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        start_of_week = (now - timedelta(days=current_weekday + 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 今週の土曜日の23時59分59秒を求める
    end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)

    ranking = QuizResult.objects.filter(
        quiz_type=quiz_type,
        completed_at__gte=start_of_week,
        completed_at__lte=end_of_week
    ).values('user__nickname').annotate(total_points=Sum('score')).order_by('-total_points')[:5]

    return JsonResponse(list(ranking), safe=False)


def get_weekly_average_score_ranking(request):
    quiz_type = request.GET.get('quiz_type')
    local_timezone = pytz.timezone('Asia/Tokyo')

    now = datetime.now().astimezone(local_timezone)
    current_weekday = now.weekday()
    
    if current_weekday == 6:
        start_of_week = now.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        start_of_week = (now - timedelta(days=current_weekday + 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)

    ranking = QuizResult.objects.filter(
        quiz_type=quiz_type,
        completed_at__gte=start_of_week,
        completed_at__lte=end_of_week
    ).values('user__nickname').annotate(average_score=Avg('score')).order_by('-average_score')[:5]

    return JsonResponse(list(ranking), safe=False)


def get_weekly_total_quiz_count_ranking(request):
    quiz_type = request.GET.get('quiz_type')
    local_timezone = pytz.timezone('Asia/Tokyo')

    now = datetime.now().astimezone(local_timezone)
    current_weekday = now.weekday()
    
    if current_weekday == 6:
        start_of_week = now.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        start_of_week = (now - timedelta(days=current_weekday + 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)

    ranking = QuizResult.objects.filter(
        quiz_type=quiz_type,
        completed_at__gte=start_of_week,
        completed_at__lte=end_of_week
    ).values('user__nickname').annotate(total_quizzes=Count('id')).order_by('-total_quizzes')[:5]

    return JsonResponse(list(ranking), safe=False)