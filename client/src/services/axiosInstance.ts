import axios from 'axios';


// 1. Створюємо "налаштований" екземпляр axios
const api = axios.create({
    // Vite сам підставить потрібне посилання залежно від того, як запущений проєкт
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
});

// 2. ПЕРЕХОПЛЮВАЧ ЗАПИТІВ (Request Interceptor)
// Спрацьовує ПЕРЕД тим, як запит полетить на сервер
api.interceptors.request.use(
    (config) => {
        // Дістаємо токен з локального сховища
        const token = localStorage.getItem('token');

        // Якщо токен є — додаємо його в заголовок
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Якщо відправляємо FormData (наприклад файли), видаляємо жорсткий Content-Type,
        // щоб браузер сам згенерував multipart/form-data разом із потрібним boundary.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. ПЕРЕХОПЛЮВАЧ ВІДПОВІДЕЙ (Response Interceptor)
// Спрацьовує, коли сервер відповів
api.interceptors.response.use(
    (response) => response, // Якщо все ок (200-299), просто пропускаємо
    (error) => {
        // Якщо помилка 401 (Не авторизований)
        if (error.response && error.response.status === 401) {
            // Перевіряємо, чи ми не робимо запит до логіну або чи не знаходимось вже на сторінці логіну
            // Якщо так, то не робимо редирект, щоб користувач міг побачити повідомлення про помилку
            if (error.config && error.config.url?.includes('/api/auth/login')) {
                return Promise.reject(error);
            }

            console.warn('Сесія закінчилася. Вихід...');

            // Чистимо сліди
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Якщо ми вже на сторінці логіну, не робимо window.location.href
            if (window.location.pathname !== '/login') {
                // Жорстко перекидаємо на логін
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;