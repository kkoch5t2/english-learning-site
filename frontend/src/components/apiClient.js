import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_API_URL}/accounts/`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const getCsrfToken = () => {
  const metaToken = document.querySelector('meta[name="csrf-token"]');
  if (metaToken) {
    return metaToken.getAttribute('content');
  }
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('csrftoken=')) {
      return cookie.substring('csrftoken='.length);
    }
  }
  return null;
};

apiClient.interceptors.request.use((config) => {
  const csrfToken = axios.defaults.headers.common['X-CSRFToken'];
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const logout = async () => {
  try {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    setAuthToken(null);
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
  } catch (error) {
    if (process.env.REACT_ENV === 'dev') {
      console.error('Error during logout:', error);
    }
  }
};

export { apiClient, setAuthToken, getAuthToken, getCsrfToken, logout };
