import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/axiosInstance';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
        setError("Паролі не співпадають!");
        return;
    }

    setIsLoading(true);

    try {
      // Відправляємо дані (без confirmPassword)
      await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });

      alert("Реєстрація успішна! Тепер увійдіть.");
      navigate('/login');
      
    } catch (err: any) {
        console.error(err);
        // Бекенд Identity часто повертає масив помилок
        if (err.response?.data && Array.isArray(err.response.data)) {
            // Збираємо всі помилки в одну строку
            const messages = err.response.data.map((e: any) => e.description).join(' ');
            setError(messages);
        } else {
            setError(err.response?.data || "Помилка реєстрації");
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Створити акаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Вже є акаунт? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Увійти</Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <input
            type="text"
            required
            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ваше повне ім'я"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />

          <input
            type="email"
            required
            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <input
            type="password"
            required
            minLength={6}
            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Пароль (мін. 6 символів)"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <input
            type="password"
            required
            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Підтвердження паролю"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;