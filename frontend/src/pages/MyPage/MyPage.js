import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, setAuthToken } from '../../components/apiClient';
import DOMPurify from 'dompurify';
import LogoutButton from '../../components/LogoutButton/LogoutButton';
import QuizPerformanceChart from '../../components/QuizPerformanceChart/QuizPerformanceChart';
import './MyPage.css';

const MyPage = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (token) {
      setAuthToken(token);
    } else {
      navigate('/login/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/mypage/');
        const sanitizedData = {
          id: DOMPurify.sanitize(response.data.id),
          username: DOMPurify.sanitize(response.data.username),
          nickname: DOMPurify.sanitize(response.data.nickname),
        };
        setProfile(sanitizedData);
      } catch (error) {
        if (process.env.REACT_ENV === 'dev') {
          console.error('Error fetching profile:', error);
        }
        if (error.response && error.response.status === 401) {
          navigate('/login/');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!profile) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="mypage-container">
      <div className="profile-section">
        <h2 className="section-title">User Profile</h2>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Nickname:</strong> {profile.nickname}</p>
        <button className="settings-button" onClick={() => navigate('/settings/user/')}>
          User Settings
        </button>
        <LogoutButton />
      </div>
      <div className="chart-section">
        <h2 className="section-title">Quiz Results</h2>
        <div className="chart-box">
          <h3 className="chart-title">Word Result</h3>
          <QuizPerformanceChart userId={profile.id} quizType="Word" />
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Idiom Result</h3>
          <QuizPerformanceChart userId={profile.id} quizType="Idiom" />
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Sentence Result</h3>
          <QuizPerformanceChart userId={profile.id} quizType="Sentence" />
        </div>
        <div className="chart-box">
          <h3 className="chart-title">Long Sentence Result</h3>
          <QuizPerformanceChart userId={profile.id} quizType="LongReading" />
        </div>
      </div>
    </div>
  );
};

export default MyPage;
