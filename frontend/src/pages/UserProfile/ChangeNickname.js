import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, setAuthToken, getCsrfToken } from '../../components/apiClient';
import DOMPurify from 'dompurify';
import './UserProfile.css';

const ChangeNickname = () => {
    const [newNickname, setNewNickname] = useState('');
    const [currentNickname, setCurrentNickname] = useState('');
    const [profile, setProfile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
        } else {
            if (process.env.REACT_ENV === 'dev') {
                console.error('No auth token found.');
            }
        }

        const fetchCsrfToken = async () => {
            await getCsrfToken();
        };
        
        fetchCsrfToken();

        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/mypage/');
                const sanitizedCurrentNickname = DOMPurify.sanitize(response.data.nickname);
                setCurrentNickname(sanitizedCurrentNickname);
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
        setNewNickname(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        const sanitizedNewNickname = DOMPurify.sanitize(newNickname);

        if (sanitizedNewNickname !== newNickname) {
            setMessage('Invalid characters detected in nickname.');
            setMessageType('error');
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }

            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/change-nickname/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ newNickname: sanitizedNewNickname, user: profile }),
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
                setMessageType('error');
            } else {
                setMessage('Nickname has been changed.');
                setMessageType('success');
                setCurrentNickname(sanitizedNewNickname);
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
        <div className="change-nickname-container">
            <h3 className="title">Change your nickname</h3>
            <p className="current-nickname">Current Nickname: {currentNickname}</p>
            <form className="nickname-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newNickname}
                    onChange={handleChange}
                    placeholder="New Nickname"
                    className="nickname-input"
                    maxLength="100"
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

export default ChangeNickname;
