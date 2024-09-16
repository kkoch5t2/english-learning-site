import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, setAuthToken, getCsrfToken } from '../../components/apiClient';
import './EnglishLongReadingQuiz.css';

const EnglishLongReadingQuiz = () => {
    const [selectedLevel, setSelectedLevel] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [user, setUser] = useState(null);
    const [results, setResults] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [showUpdateButton, setShowUpdateButton] = useState(true);
    const [showLevelSelection, setShowLevelSelection] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
        } else {
            navigate('/login/');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await apiClient.get('/mypage/');
                setUser(response.data.username);
            } catch (error) {
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error fetching user profile:', error);
                }
                navigate('/login/');
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const fetchQuizData = async (level) => {
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/long-reading-quiz/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ level: level }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const randomQuiz = data[Math.floor(Math.random() * data.length)];
            setQuizData(randomQuiz);
        } catch (error) {
            if (process.env.REACT_ENV === 'dev') {
                console.error('Error fetching quiz data:', error);
            }
        }
    };

    const saveQuizResult = async (quizType, level, score) => {
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/save-quiz-result/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({
                    user: user,
                    quiz_type: quizType,
                    level: level,
                    score: score,
                    completed_at: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            if (process.env.REACT_ENV === 'dev') {
                console.error('Error saving quiz result:', error);
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let correctAnswersCount = 0;
        const resultsTemp = {};

        quizData.question.questions.forEach((question, questionIndex) => {
            const questionKey = `question-${questionIndex}`;
            const userAnswer = answers[questionKey];
            const correctAnswer = question.correctAnswer;

            if (userAnswer === correctAnswer) {
                correctAnswersCount += 1;
                resultsTemp[questionKey] = `〇正解！`;
            } else {
                resultsTemp[questionKey] = `×不正解！<br>正解は: ${question.options[correctAnswer]}`;
            }
        });

        setScore(correctAnswersCount);
        setResults(resultsTemp);
        setSubmitted(true);
        setShowUpdateButton(false);
        setShowLevelSelection(true);

        await saveQuizResult('LongReading', selectedLevel, correctAnswersCount);
    };

    const handleUpdateQuiz = () => {
        setQuizData(null);
        setAnswers({});
        setScore(null);
        setResults({});
        setSubmitted(false);
        setShowUpdateButton(true);
        setShowLevelSelection(false);
    };

    const handleGoToLevelSelection = () => {
        setQuizData(null);
        setAnswers({});
        setScore(null);
        setResults({});
        setSelectedLevel('');
        setSubmitted(false);
        setShowUpdateButton(true);
        setShowLevelSelection(false);
    };

    if (!quizData) {
        return (
            <div className="level-selection">
                <h2>Select Long Sentence Quiz Level</h2>
                <div className="level-buttons">
                    <button className="level-btn" onClick={() => { setSelectedLevel('TOEIC_SCORE_300'); fetchQuizData('300'); }}>
                        TOEIC Score 300 Level
                    </button>
                    <button className="level-btn" onClick={() => { setSelectedLevel('TOEIC_SCORE_600'); fetchQuizData('600'); }}>
                        TOEIC Score 600 Level
                    </button>
                    <button className="level-btn" onClick={() => { setSelectedLevel('TOEIC_SCORE_900'); fetchQuizData('900'); }}>
                        TOEIC Score 900 Level
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <div className="quiz-question">
                    <h2>{quizData.question.text}</h2>
                    <p>{quizData.question.passage}</p>
                    {quizData.question.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="question">
                            <p>{question.questionText}</p>
                            <ul className="options">
                                {Object.keys(question.options).map((optionKey) => {
                                    const questionKey = `question-${questionIndex}`;
                                    return (
                                        <li key={optionKey}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={questionKey}
                                                    value={optionKey}
                                                    onChange={() => setAnswers({
                                                        ...answers,
                                                        [questionKey]: optionKey,
                                                    })}
                                                />
                                                {question.options[optionKey]}
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                            {results[`question-${questionIndex}`] && (
                                <p className="result" dangerouslySetInnerHTML={{ __html: results[`question-${questionIndex}`] }} />
                            )}
                        </div>
                    ))}
                </div>
                {score !== null && (
                    <div className="quiz-result">
                        <p>Your score: {score} out of {quizData.question.questions.length}</p>
                    </div>
                )}
                {!submitted && (
                    <button type="submit" className="answer-btn">Submit Answers</button>
                )}
                
                {showUpdateButton && (
                    <button className="quiz-update-btn" onClick={handleUpdateQuiz}>
                        Update Quiz
                    </button>
                )}

                {showLevelSelection && (
                    <button className="level-btn" onClick={handleGoToLevelSelection}>
                        Go to Level Selection
                    </button>
                )}
            </form>
        </div>
    );
};

export default EnglishLongReadingQuiz;
