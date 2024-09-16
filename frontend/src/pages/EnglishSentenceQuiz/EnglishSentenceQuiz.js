import React, { useState, useEffect } from 'react';
import { apiClient, setAuthToken, getCsrfToken } from '../../components/apiClient';
import './EnglishSentenceQuiz.css';

const EnglishSentenceQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }

    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('/mypage/');
        setUser(response.data.username);
      } catch (error) {
        if (process.env.REACT_ENV === 'dev') {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const fetchQuizData = async (level) => {
    setLoading(true);
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/sentence-quiz/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ level: level }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setQuizData(data);
      setLoading(false);
    } catch (error) {
      if (process.env.REACT_ENV === 'dev') {
        console.error('Error fetching quiz data:', error);
      }
      setLoading(false);
    }
  };

  const saveQuizResult = async (result) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/save-quiz-result/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        throw new Error(`Failed to save quiz result: ${response.statusText}`);
      }
    } catch (error) {
      if (process.env.REACT_ENV === 'dev') {
        console.error('Error saving quiz result:', error);
      }
    }
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    fetchQuizData(level);
  };

  const handleAnswerClick = (selectedAnswer) => {
    setUserAnswer(selectedAnswer);

    if (selectedAnswer === quizData[currentQuestion].answer) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setUserAnswer('');
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      const quizResult = {
        user: user,
        quiz_type: 'Sentence',
        level: selectedLevel,
        score: score,
        completed_at: new Date().toISOString(),
      };
      saveQuizResult(quizResult);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!selectedLevel) {
    return (
      <div>
        <h2>Select Sentence Quiz Level</h2>
        <div className="level-buttons">
          <button onClick={() => handleLevelSelect('TOEIC_SCORE_300')} className="level-btn">TOEIC Score 300 Level</button>
          <button onClick={() => handleLevelSelect('TOEIC_SCORE_600')} className="level-btn">TOEIC Score 600 Level</button>
          <button onClick={() => handleLevelSelect('TOEIC_SCORE_900')} className="level-btn">TOEIC Score 900 Level</button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div>
        <h2>Quiz Complete!</h2>
        <p>Your Score: {score} / 10</p>
      </div>
    );
  }

  if (!quizData.length) {
    return <p>Loading quiz data...</p>;
  }

  return (
    <div className="container">
      {showResult ? (
        <div>
          <p>{userAnswer === quizData[currentQuestion].answer ? '〇正解！' : '×不正解！'}</p>
          <p>正解は: {quizData[currentQuestion].choices[quizData[currentQuestion].answer]}</p>
          <button onClick={nextQuestion} className="quiz-btn">Next</button>
        </div>
      ) : (
        <div>
          <h2>{quizData[currentQuestion].question}</h2>
          <div className="sentence-choices-container">
            {Object.keys(quizData[currentQuestion].choices).map((key) => (
              <button key={key} onClick={() => handleAnswerClick(key)} className="quiz-btn">
                {quizData[currentQuestion].choices[key]}
              </button>
            ))}
          </div>
        </div>
      )}
      <p>Score: {score}</p>
    </div>
  );
};

export default EnglishSentenceQuiz;
