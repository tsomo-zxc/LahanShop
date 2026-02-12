import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccessPage = () => {
  const { id } = useParams(); // Отримуємо ID замовлення з URL

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-gray-50 text-center px-4">
      <FaCheckCircle className="text-green-500 text-6xl mb-4" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Дякуємо за замовлення!</h1>
      <p className="text-gray-600 mb-8">Ваше замовлення <span className="font-bold">#{id}</span> успішно створено.</p>
      
      <div className="space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">
            На головну
        </Link>
        <Link to="/orders" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
            Переглянути мої замовлення
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;