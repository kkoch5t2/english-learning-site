import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TopPage.css';

const TopPage = () => {
    const navigate = useNavigate();

    return (
        <div className="top-page-container">
            <section className="intro-section">
                <h2>Welcome to English Learning</h2>
                <p>
                    This site helps you improve your English skills through various quizzes.<br/>
                    You can choose from Word, Idiom, Sentence, and Long Sentence quizzes.<br/>
                    Select a quiz type to get started and improve your English!
                </p>
            </section>
            <section className="quiz-selection-section">
                <h3>Select a Quiz Level</h3>
                <div className="quiz-selection-buttons">
                    <button className="quiz-selection-btn" onClick={() => navigate('/english-exercise/word/')}>
                        Word Quiz
                    </button>
                    <button className="quiz-selection-btn" onClick={() => navigate('/english-exercise/idiom/')}>
                        Idiom Quiz
                    </button>
                    <button className="quiz-selection-btn" onClick={() => navigate('/english-exercise/sentence/')}>
                        Sentence Quiz
                    </button>
                    <button className="quiz-selection-btn" onClick={() => navigate('/english-exercise/long-reading/')}>
                        Long Sentence Quiz
                    </button>
                </div>
            </section>
        </div>
    );
};

export default TopPage;
