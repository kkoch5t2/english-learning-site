import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validatePassword, sanitizeInput } from '../../components/validation';
import './PasswordReset.css';

const PasswordResetConfirm = () => {
    const { uidb64, token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.clear();
        localStorage.clear();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        const sanitizedPassword = sanitizeInput(password);
        const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

        if (sanitizedPassword !== password || sanitizedConfirmPassword !== confirmPassword) {
            setMessage('Invalid characters detected in password.');
            setIsError(true);
            return;
        }

        if (sanitizedPassword !== sanitizedConfirmPassword) {
            setMessage('Passwords do not match.');
            setIsError(true);
            return;
        }

        const passwordValidationMessage = validatePassword(sanitizedPassword);
        if (passwordValidationMessage) {
            setMessage(passwordValidationMessage);
            setIsError(true);
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/password-reset-confirm/${uidb64}/${token}/`, { password: sanitizedPassword });
            setMessage('Password has been reset successfully.');
            setIsError(false);
            setTimeout(() => {
                navigate('/login/');
            }, 2000); // Redirect after 2 seconds
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            setIsError(true);
        }
    };

    return (
        <div className="password-reset-container">
            <h2 className="title">Reset Your Password</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label>New Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter new password" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="Confirm new password" 
                        required 
                    />
                </div>
                <button type="submit" className="button">Set New Password</button>
            </form>
            {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
        </div>
    );
};

export default PasswordResetConfirm;
