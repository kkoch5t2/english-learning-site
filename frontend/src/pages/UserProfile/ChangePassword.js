import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { validatePassword } from '../../components/validation';
import { apiClient, setAuthToken, getCsrfToken } from '../../components/apiClient';
import DOMPurify from 'dompurify';
import './UserProfile.css';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profile, setProfile] = useState(null);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
        }

        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/mypage/');
                setProfile(response.data);
            } catch (error) {
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error fetching profile:', error);
                }
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        
        const passwordError = validatePassword(newPassword, profile?.username, profile?.nickname);
        if (passwordError) {
            setMessage(passwordError);
            setIsError(true);
            return;
        }

        const sanitizedNewPassword = DOMPurify.sanitize(newPassword);
        const sanitizedConfirmPassword = DOMPurify.sanitize(confirmPassword);

        if (sanitizedNewPassword !== newPassword || sanitizedConfirmPassword !== confirmPassword) {
            setMessage('Invalid characters detected in password.');
            setIsError(true);
            return;
        }

        if (sanitizedNewPassword !== sanitizedConfirmPassword) {
            setMessage('Password does not match.');
            setIsError(true);
            return;
        }

        const csrfToken = getCsrfToken();
        fetch(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/change-password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify({ newPassword: sanitizedNewPassword, user: profile }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setMessage(data.error);
                    setIsError(true);
                } else {
                    setMessage('Password has been changed.');
                    setIsError(false);
                }
            })
            .catch(error => {
                setMessage('An error has occurred.');
                setIsError(true);
                if (process.env.REACT_ENV === 'dev') {
                    console.error('Error:', error);
                }
            });
    };
    
    return (
        <div className="change-password-container">
            <h3 className="title">Change your password</h3>
            <form className="password-form" onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="password-input"
                    required
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="password-input"
                    required
                />
                <div className="button-group">
                    <button type="submit" className="submit-button">Change</button>
                    <Link to="/settings/user/" className="back-button">Back</Link>
                </div>
            </form>
            {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
        </div>
    );
};

export default ChangePassword;
