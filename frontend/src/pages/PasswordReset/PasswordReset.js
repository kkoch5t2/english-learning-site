import React, { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './PasswordReset.css';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);
        const sanitizedEmail = DOMPurify.sanitize(email);

        if (sanitizedEmail !== email) {
            setMessage('Invalid characters detected in email.');
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/password-reset/`, { email: sanitizedEmail });
            setLoading(false);
            setMessage('A password reset email has been sent.');
            setIsError(false);
        } catch (error) {
            setLoading(false);
            setMessage('An error occurred. Please try again.');
            setIsError(true);
        }
    };

    return (
        <div className="password-reset-container">
            <h2 className="title">Password Reset</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Enter your email" 
                        required 
                    />
                </div>
                <button type="submit" className="button" disabled={loading}>
                    {loading ? 'Processing...' : 'Reset Password'}
                </button>
            </form>
            {message && (
                <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>
            )}
        </div>
    );
};

export default PasswordReset;
