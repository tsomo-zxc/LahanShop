import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/axiosInstance'; // Наш налаштований axios
import { useAuth } from '../../context/AuthContext'; // Наш контекст

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Для повторного відправлення листа
  const [showResend, setShowResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  const { login } = useAuth(); // Беремо функцію login з контексту
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setResendStatus('idle');
    setResendMessage('');
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

    } catch (err) {
      console.error(err);

      let errorMessage = "Не вдалося увійти. Перевірте дані.";

      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        const errorCode = err.response.data?.ErrorCode;

        if (status === 403 || errorCode === 'EmailNotConfirmed') {
          errorMessage = 'Будь ласка, підтвердіть вашу пошту перед входом.';
          setShowResend(true);
        } else if (status === 423 || errorCode === 'AccountLocked') {
          errorMessage = 'Акаунт тимчасово заблоковано через велику кількість невдалих спроб входу.';
        } else if (status === 401) {
          errorMessage = 'Невірний email або пароль';
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) return;

    setResendStatus('loading');
    setResendMessage('');

    try {
      await api.post('/api/auth/resend-confirmation-email', { email });
      setResendStatus('success');
      setResendMessage('Лист успішно відправлено! Перевірте пошту.');
      setResendCooldown(30); // 30 секунд затримки
    } catch (err) {
      setResendStatus('error');
      if (axios.isAxiosError(err) && err.response?.data?.Message) {
        setResendMessage(err.response.data.Message);
      } else {
        setResendMessage('Помилка при відправленні листа. Спробуйте пізніше.');
      }
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
          {error && (
            <div className="flex flex-col gap-2">
              <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>

              {showResend && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col items-center">
                  <p className="text-sm text-blue-800 mb-2 text-center">Не отримали лист?</p>
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendCooldown > 0 || resendStatus === 'loading'}
                    className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors ${resendCooldown > 0 || resendStatus === 'loading'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      }`}
                  >
                    {resendStatus === 'loading' ? 'Відправлення...' :
                      resendCooldown > 0 ? `Надіслати повторно через ${resendCooldown}с` :
                        'Надіслати лист знову'}
                  </button>

                  {resendMessage && (
                    <p className={`mt-2 text-xs text-center ${resendStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Забули пароль?
              </Link>
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