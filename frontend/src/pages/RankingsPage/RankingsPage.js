import React from 'react';
import Ranking from '../../components/Ranking/Ranking';
import './RankingsPage.css';

const RankingsPage = () => {
    const quizTypes = ['Word', 'Idiom', 'Sentence', 'LongReading'];
    const rankingTypes = ['total-points', 'average-score', 'total-quiz-count'];

    const getDisplayQuizType = (quizType) => {
        return quizType === 'LongReading' ? 'Long Sentence' : quizType;
    };

    return (
        <div className="rankings-page-container">
            {quizTypes.map(quizType => (
                <div key={quizType} className="quiz-type-section">
                    <h1>Weekly {getDisplayQuizType(quizType)} Rankings</h1>
                    <div className="rankings-row">
                        {rankingTypes.map(rankingType => (
                            <Ranking key={rankingType} quizType={quizType} rankingType={rankingType} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RankingsPage;
