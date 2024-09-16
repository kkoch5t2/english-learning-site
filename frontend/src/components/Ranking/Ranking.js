import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import './Ranking.css';
import { getCsrfToken } from '../apiClient';

const Ranking = ({ quizType, rankingType }) => {
    const [rankingData, setRankingData] = useState([]);
    const displayQuizType = quizType === 'LongReading' ? 'Long Sentence' : quizType;

    useEffect(() => {
        if (!quizType || !rankingType) return;

        const fetchRankingData = async () => {
            try {
                const csrfToken = getCsrfToken();
                const sanitizedQuizType = DOMPurify.sanitize(quizType);
                const sanitizedRankingType = DOMPurify.sanitize(rankingType);

                const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/ranking/${sanitizedRankingType}/?quiz_type=${sanitizedQuizType}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    credentials: 'include',
                });
                const data = await response.json();
                setRankingData(data.slice(0, 5));
            } catch (error) {
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error fetching ranking data:', error);
                }
            }
        };

        fetchRankingData();
    }, [quizType, rankingType]);

    return (
        <div className="ranking-section">
            <h2>{rankingType.replace('-', ' ')} Ranking for {displayQuizType}</h2>
            <ol className="ranking-list">
                {rankingData.map((entry, index) => (
                    <li key={index} className="ranking-item">
                        {entry.user__nickname}: {rankingType === 'average-score' ? entry.average_score.toFixed(2) : entry[rankingType === 'total-points' ? 'total_points' : 'total_quizzes']}
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default Ranking;
