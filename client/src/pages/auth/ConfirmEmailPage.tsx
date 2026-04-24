import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../../services/axiosInstance';
import SEO from '../../components/SEO';

const ConfirmEmailPage = () => {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    const hasRequested = useRef(false);

    useEffect(() => {
        const confirmEmail = async () => {
            // Check for the presence of parameters
            if (!userId || !token) {
                setStatus('error');
                setErrorMessage('Некоректне або відсутнє посилання для підтвердження.');
                return;
            }

            try {
                await api.post('/api/auth/confirm-email', { userId, token });
                setStatus('success');
            } catch (err) {
                setStatus('error');
                if (axios.isAxiosError(err) && err.response?.data?.Message) {
                    setErrorMessage(err.response.data.Message);
                } else {
                    setErrorMessage('Невірне посилання або сталась помилка');
                }
            }
        };

        // Protection against double call
        if (!hasRequested.current) {
            hasRequested.current = true;
            confirmEmail();
        }
    }, [userId, token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
            <SEO
                title="Підтвердження пошти"
                description="Підтвердження пошти"
                url="https://lahan-shop.vercel.app/confirm-email"
                robots="noindex, nofollow"
            />
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {/* Loading state */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <FaSpinner className="animate-spin text-5xl text-blue-600 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Перевіряємо посилання...
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Будь ласка, зачекайте. Це займе лише кілька секунд.
                        </p>
                    </div>
                )}
                {/* Success state */}
                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-green-100 p-4 rounded-full mb-6">
                            <FaCheckCircle className="text-5xl text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Пошту успішно підтверджено!
                        </h2>
                        <p className="text-gray-600 text-sm mb-8">
                            Ваш акаунт активовано. Тепер ви можете увійти в систему.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                        >
                            Перейти до входу
                        </Link>
                    </div>
                )}
                {/* Error state */}
                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-red-100 p-4 rounded-full mb-6">
                            <FaTimesCircle className="text-5xl text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Помилка підтвердження
                        </h2>
                        <p className="text-gray-600 text-sm mb-8">
                            {errorMessage}
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                        >
                            Повернутися до входу
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmailPage;
