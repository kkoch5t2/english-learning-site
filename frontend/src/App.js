import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import MyPage from './pages/MyPage/MyPage';
import './App.css';
import Topbar from './components/Topbar/Topbar';
import Navbar from './components/Navbar/Navbar';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import EnglishSentenceQuiz from './pages/EnglishSentenceQuiz/EnglishSentenceQuiz';
import EnglishIdiomQuiz from './pages/EnglishIdiomQuiz/EnglishIdiomQuiz';
import EnglishWordQuiz from './pages/EnglishWordQuiz/EnglishWordQuiz';
import EnglishLongReadingQuiz from './pages/EnglishLongReadingQuiz/EnglishLongReadingQuiz';
import PasswordReset from './pages/PasswordReset/PasswordReset';
import PasswordResetConfirm from './pages/PasswordReset/PasswordResetConfirm';
import ChangeEmail from './pages/UserProfile/ChangeEmail';
import ChangeUsername from './pages/UserProfile/ChangeUsername';
import ChangePassword from './pages/UserProfile/ChangePassword';
import RankingsPage from './pages/RankingsPage/RankingsPage';
import TopPage from './pages/TopPage/TopPage';
import ChangeNickname from './pages/UserProfile/ChangeNickname';
import UserSettings from './pages/UserProfile/UserSettings';
import { logout } from './components/apiClient';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      logout();
      navigate('/login/');
    }, 1800000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="app-container">
      <Topbar />
      <Navbar />
      <main>
        <Routes>
          <Route path="/register/" element={<Register />} />
          <Route path="/login/" element={<Login />} />
          <Route path="/password-reset/" element={<PasswordReset />} />
          <Route path="/password-reset-confirm/:uidb64/:token/" element={<PasswordResetConfirm />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<TopPage />} />
            <Route path="/mypage/" element={<MyPage />} />
            <Route path="/settings/user/" element={<UserSettings />} />
            <Route path="/settings/user/change-username/" element={<ChangeUsername />} />
            <Route path="/settings/user/change-nickname/" element={<ChangeNickname />} />
            <Route path="/settings/user/change-email/" element={<ChangeEmail />} />
            <Route path="/settings/user/change-email-confirm/:uidb64/:token/" element={<PasswordResetConfirm />} />
            <Route path="/settings/user/change-password/" element={<ChangePassword />} />
            <Route path="/english-exercise/word/" element={<EnglishWordQuiz />} />
            <Route path="/english-exercise/idiom/" element={<EnglishIdiomQuiz />} />
            <Route path="/english-exercise/sentence/" element={<EnglishSentenceQuiz />} />
            <Route path="/english-exercise/long-reading/" element={<EnglishLongReadingQuiz />} />
            <Route path="/ranking/" element={<RankingsPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
