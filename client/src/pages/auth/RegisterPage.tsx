import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../../services/axiosInstance';
import { FaEnvelope } from 'react-icons/fa';
import SEO from '../../components/SEO';

interface IdentityError {
  code: string;
  description: string;
}

const RegisterPage = () => {
  // User input fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state variables
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Handles the registration form submission.
   * Validates form data, calls the API, and handles potential errors.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic frontend validation: check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не співпадають!");
      return;
    }

    setIsLoading(true);

    try {
      // Send registration data to the API (excluding confirmPassword)
      await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      });

      setIsSuccess(true);

    } catch (err) {
      console.error(err);

      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;

        switch (true) {
          case Array.isArray(data): {
            // Cast data to our expected IdentityError interface and join descriptions
            const messages = (data as IdentityError[])
              .map(e => e.description)
              .join(' ');
            setError(messages);
            break;
          }
          case Boolean(data.errors && typeof data.errors === 'object'): {
            const errorMessages = Object.values(data.errors)
              .flat()
              .join(' ');
            setError(errorMessages as string);
            break;
          }
          case Boolean(data.Message || data.message):
            setError(data.Message || data.message);
            break;
          case typeof data === 'string':
            setError(data);
            break;
          default:
            setError("Помилка реєстрації. Перевірте введені дані.");
            break;
        }
      } else {
        setError("Сталася невідома помилка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <SEO
        title="Реєстрація"
        description="Реєстрація"
        url="https://lahan-shop.vercel.app/register"
        robots="noindex, nofollow"
      />
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {isSuccess ? (
          /* SUCCESS STATE UI */
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaEnvelope className="text-5xl text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Перевірте вашу пошту
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed px-4 mb-8">
              Ми відправили посилання для підтвердження на вашу електронну адресу. Будь ласка, перейдіть за ним для завершення реєстрації.
            </p>
            <Link
              to="/"
              className="inline-flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
            >
              Повернутися на головну
            </Link>
          </div>
        ) : (
          /* REGISTRATION FORM UI */
          <div className="space-y-8">
            {/* Form Header */}
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Створити акаунт
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Вже є акаунт? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Увійти</Link>
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {/* Error messages display */}
              {error && <div className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</div>}

              {/* Form Input fields */}
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ваше повне ім'я"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <input
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <input
                type="password"
                required
                minLength={6}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Пароль (мін. 6 символів)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <input
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Підтвердження паролю"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
        )}
      </div>
    </div>
  );
};

export default RegisterPage;