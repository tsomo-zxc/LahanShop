import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/axiosInstance'; // Наш налаштований axios
import { useAuth } from '../../context/AuthContext'; // Наш контекст

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth(); // Беремо функцію login з контексту
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Відправляємо дані на сервер
      const response = await api.post('/api/auth/login', { email, password });
      
      // 2. Отримуємо відповідь (DTO з токеном і даними)
      const { token, email: userEmail, fullName, role } = response.data;

      // 3. Зберігаємо в контекст (це автоматично оновить localStorage)
      login(token, { email: userEmail, fullName, role });

      // 4. Перекидаємо користувача
      // Якщо Адмін -> в адмінку, якщо Юзер -> на головну
      if (role === 'Admin') {
          navigate('/admin');
      } else {
          navigate('/');
      }
      
    } catch (err) { // 1. Прибираємо : any
      console.error(err);
      
      let errorMessage = "Не вдалося увійти. Перевірте дані.";

      // 2. Перевіряємо тип помилки
      if (axios.isAxiosError(err)) {
          // Якщо сервер прислав текст помилки
          if (typeof err.response?.data === 'string') {
              errorMessage = err.response.data;
          }
          // Якщо сервер прислав JSON об'єкт { message: "..." }
          else if (err.response?.data?.message) {
              errorMessage = err.response.data.message;
          }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вхід в акаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Або <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">зареєструйтеся</Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"                
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email адреса"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Вхід...' : 'Увійти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;