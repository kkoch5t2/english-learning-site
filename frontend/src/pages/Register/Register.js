import React, { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { validatePassword, validateUsername } from '../../components/validation';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const passwordError = validatePassword(password, username, nickname);
        if (passwordError) {
            setMessage(passwordError);
            setIsError(true);
            return;
        }

        const usernameError = validateUsername(username);
        if (usernameError) {
            setMessage(usernameError);
            setIsError(true);
            return;
        }

        const sanitizedUsername = DOMPurify.sanitize(username);
        const sanitizedNickname = DOMPurify.sanitize(nickname);
        const sanitizedEmail = DOMPurify.sanitize(email);
        const sanitizedPassword = DOMPurify.sanitize(password);

        if (sanitizedUsername !== username || sanitizedNickname !== nickname || sanitizedEmail !== email || sanitizedPassword !== password) {
            setMessage('Invalid characters detected in input.');
            setIsError(true);
            return;
        }

        const user = { username: sanitizedUsername, nickname: sanitizedNickname, email: sanitizedEmail, password: sanitizedPassword };
        setLoading(true);

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/register/`, user);
            setLoading(false);
            setMessage('User registered successfully! Please check your email to activate your account.');
            setIsError(false);
        } catch (error) {
            setLoading(false);
            if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage('Registration failed. Please try again later.');
            }
            setIsError(true);
        }
    };

    return (
        <div className="register-container">
            <h2 className="register-title">Register</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        maxLength="150"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Nickname:</label>
                    <input 
                        type="text" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        maxLength="100"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength="255"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                </div>
                <button type="submit" className="register-button" disabled={loading}>
                    {loading ? 'loading...' : 'Register'}
                </button>
            </form>
            {message && <p className={`message ${isError ? 'error' : 'success'}`}>{message}</p>}
        </div>
    );
};

export default Register;
