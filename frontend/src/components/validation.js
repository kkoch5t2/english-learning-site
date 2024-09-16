import DOMPurify from 'dompurify';

export const validatePassword = (password, username = '', nickname = '') => {
    if (password.length < 8) {
        return 'Password must be at least 8 characters long.';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!/\d/.test(password)) {
        return 'Password must contain at least one digit.';
    }
    if (
        (username && password.toLowerCase().includes(username.toLowerCase())) ||
        (nickname && password.toLowerCase().includes(nickname.toLowerCase()))
    ) {
        return 'Password should not be similar to your username or nickname.';
    }
    return null;
};

export const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        return 'Username can only contain letters and numbers.';
    }
    return null;
};

export const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input);
};
