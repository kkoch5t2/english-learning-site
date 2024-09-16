import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../../components/apiClient';
import { validateUsername, sanitizeInput } from '../../components/validation';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/mypage/');
    }

    const params = new URLSearchParams(location.search);
    if (params.get('delete_session') === 'true') {
      sessionStorage.clear();
      localStorage.clear();
    }

    const checkLoginAttempts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/check-login-attempts/`);
        if (process.env.REACT_ENV === 'dev') {
          console.log(response);
        }
      } catch (error) {
        if (error.response && error.response.status === 429) {
          setLoginDisabled(true);
          setError('Too many login attempts. Please try again later.');
        } else {
          if (process.env.REACT_ENV === 'dev') {
            console.error('Error checking login attempts:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkLoginAttempts();
  }, [navigate, location, loginDisabled]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (loginDisabled) {
    return <p>{error}</p>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedPassword = sanitizeInput(password);

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/login/`, {
        username: sanitizedUsername,
        password: sanitizedPassword,
      });

      const token = response.data.token;
      localStorage.setItem('authToken', token);
      setAuthToken(token);
      const csrfResponse = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/csrf-token/`, { withCredentials: true });
      const csrfToken = csrfResponse.data.csrfToken;
      axios.defaults.headers.common['X-CSRFToken'] = csrfToken;

      navigate('/mypage/');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Invalid credentials. Please try again.');
        if (error.response.status === 429) {
          setLoginDisabled(true);
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">Login</button>
      </form>
      <a href='/register/' className="register-link">Register</a>
      <a href='/password-reset/' className="register-link">Password Reset</a>
    </div>
  );
};

export default Login;
