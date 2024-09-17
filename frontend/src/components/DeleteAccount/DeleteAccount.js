import React from 'react';
import axios from 'axios';
import { getCsrfToken, getAuthToken, logout } from '../apiClient';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
    const navigate = useNavigate();

    const handleDelete = async (event) => {
        event.preventDefault();
        const csrfToken = getCsrfToken();
        const authToken = getAuthToken();
        const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (confirmDelete) {
            try {
                const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/accounts/delete-user/`, {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Authorization': `Token ${authToken}`
                    },
                    withCredentials: true
                });
                alert(response.data.message);
                await logout(); // ログアウト処理を追加
                navigate('/login'); // useNavigateを使用してリダイレクト
            } catch (error) {
                console.error('There was an error deleting the user!', error);
            }
        }
    };

    return (
        <a href="/delete-account" onClick={handleDelete}>Delete Account</a>
    );
};

export default DeleteAccount;
