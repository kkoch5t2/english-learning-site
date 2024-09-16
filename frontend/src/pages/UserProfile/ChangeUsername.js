import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { validateUsername, sanitizeInput } from '../../components/validation';
import { apiClient, setAuthToken, getCsrfToken } from '../../components/apiClient';
import './UserProfile.css';

const ChangeUsername = () => {
    const [newUsername, setNewUsername] = useState('');
    const [currentUsername, setCurrentUsername] = useState('');
    const [profile, setProfile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
        }

        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/mypage/');
                setCurrentUsername(response.data.username);
                setProfile(response.data);
            } catch (error) {
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error fetching profile:', error);
                }
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setNewUsername(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        const usernameError = validateUsername(newUsername);
        if (usernameError) {
            setMessage(usernameError);
            setMessageType('error');
            return;
        }

        const sanitizedNewUsername = sanitizeInput(newUsername);

        if (sanitizedNewUsername !== newUsername) {
            setMessage('Invalid characters detected in username.');
            setMessageType('error');
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/change-username/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ newUsername: sanitizedNewUsername, user: profile }),
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
                setMessageType('error');
            } else {
                setMessage('User name has been changed.');
                setMessageType('success');
                setCurrentUsername(sanitizedNewUsername);
            }
        } catch (error) {
            setMessage('An error has occurred.');
            setMessageType('error');
            if (process.env.REACT_ENV === 'dev') {
                console.error('Error:', error);
            }
        }
    };

    return (
        <div className="change-username-container">
            <h3 className="title">Change your username</h3>
            <p className="current-username">Current Username: {currentUsername}</p>
            <form className="username-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newUsername}
                    onChange={handleChange}
                    placeholder="New Username"
                    className="username-input"
                    maxLength="150"
                    required
                />
                <div className="button-group">
                    <button type="submit" className="submit-button">Change</button>
                    <Link to="/settings/user/" className="back-button">Back</Link>
                </div>
            </form>
            {message && (
                <p className={`message ${messageType}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ChangeUsername;
