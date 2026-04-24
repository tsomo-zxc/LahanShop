import axios from 'axios';


// 1. AXIOS
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
});

// 2. REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (error.config && error.config.url?.includes('/api/auth/login')) {
                return Promise.reject(error);
            }

            console.warn('Сесія закінчилася. Вихід...');

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;