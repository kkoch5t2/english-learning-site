import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './QuizPerformanceChart.css';
import { getCsrfToken } from '../apiClient';
Chart.register(...registerables);

const QuizPerformanceChart = ({ userId, quizType }) => {
    const [weeklyResults, setWeeklyResults] = useState([]);
    const [weeklyPoints, setWeeklyPoints] = useState({});
    const [averageScores, setAverageScores] = useState({});

    useEffect(() => {
        if (!userId || !quizType) return;

        const csrfToken = getCsrfToken();

        const fetchWeeklyResults = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/weekly-quiz-results/?user_id=${userId}&quiz_type=${quizType}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                    credentials: 'include',
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    setWeeklyResults(data);
                } else {
                    if (process.env.REACT_ENV === 'dev') {
                        console.error('Expected array but got:', data);
                    }
                }
            } catch (error) {
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error fetching weekly quiz results:', error);
                }
            }
        };

        const fetchWeeklyPoints = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/weekly-points/?user_id=${userId}&quiz_type=${quizType}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                    credentials: 'include',
                });
                const data = await response.json();
                setWeeklyPoints(data);
            } catch (error) {
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error fetching weekly points:', error);
                }
            }
        };

        const fetchWeeklyAveragePoints = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/english-exercise/weekly-average-points/?user_id=${userId}&quiz_type=${quizType}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                    credentials: 'include',
                });
                const data = await response.json();
                setAverageScores(data);
            } catch (error) {
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error fetching weekly average points:', error);
                }
            }
        };

        fetchWeeklyResults();
        fetchWeeklyPoints();
        fetchWeeklyAveragePoints();
    }, [userId, quizType]);

    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
        return jstDate.toISOString().split('T')[0];
    }).reverse();

    const resultsData = dates.map(date => {
        const dayResult = weeklyResults.find(result => result.date === date);
        return dayResult ? dayResult.results.length : 0;
    });

    const pointsData = dates.map(date => weeklyPoints[date] || 0);
    const averageData = dates.map(date => averageScores[date] || 0);

    const data = {
        labels: dates,
        datasets: [
            {
                label: 'Quiz Count',
                data: resultsData,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
                tension: 0.1
            },
            {
                label: 'Total Score',
                data: pointsData,
                borderColor: 'rgba(255,99,132,1)',
                backgroundColor: 'rgba(255,99,132,0.2)',
                fill: true,
                tension: 0.1
            },
            {
                label: 'Average Score',
                data: averageData,
                borderColor: 'rgba(54,162,235,1)',
                backgroundColor: 'rgba(54,162,235,0.2)',
                fill: true,
                tension: 0.1
            }
        ]
    };

    return (
        <div className="chart-container">
            <Line data={data} />
        </div>
    );
};

export default QuizPerformanceChart;
