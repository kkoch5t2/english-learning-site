import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, setAuthToken, getCsrfToken } from '../../components/apiClient';
import DOMPurify from 'dompurify';
import './UserProfile.css';

const ChangeEmail = () => {
    const [newEmail, setNewEmail] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [profile, setProfile] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
        }

        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/mypage/');
                const sanitizedCurrentEmail = DOMPurify.sanitize(response.data.email);
                setCurrentEmail(sanitizedCurrentEmail);
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
        setNewEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);
        const sanitizedNewEmail = DOMPurify.sanitize(newEmail);

        if (sanitizedNewEmail !== newEmail) {
            setStatusMessage({ type: 'error', text: 'Invalid characters detected in email.' });
            setLoading(false);
            return;
        }

        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/change-email/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ newEmail: sanitizedNewEmail, user: profile }),
            });
            const data = await response.json();
            setLoading(false);

            if (data.error) {
                setStatusMessage({ type: 'error', text: data.error });
            } else {
                setStatusMessage({ type: 'success', text: 'A confirmation email has been sent.' });
            }
        } catch (error) {
            setLoading(false);
            setStatusMessage({ type: 'error', text: 'Email change failed.' });
            if (process.env.REACT_ENV === 'dev') {
                console.error('Error:', error);
            }
        }
    };

    return (
        <div className="change-email-container">
            <h3 className="title">Change email</h3>
            <p className="current-email">Current your email: {currentEmail}</p>
            <form className="email-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={newEmail}
                    onChange={handleChange}
                    placeholder="New Email"
                    className="email-input"
                    maxLength="255"
                    required
                />
                <div className="button-group">
                    <button type="submit" className="submit-button" disabled={loading}>
                        Change
                    </button>
                    <Link to="/settings/user/" className="back-button">Back</Link>
                </div>
            </form>

            {loading && <p className="loading-text">Loading...</p>}

            {statusMessage && (
                <p className={`message ${statusMessage.type}`}>
                    {statusMessage.text}
                </p>
            )}
        </div>
    );
};

export default ChangeEmail;
