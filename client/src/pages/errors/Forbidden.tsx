import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import SEO from '../../components/SEO';

const Forbidden: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <SEO
        title="403 - Доступ заборонено"
        description="403 - Доступ заборонено"
        url="https://lahan-shop.vercel.app/403"
      />
      <div className="text-red-500 mb-6 animate-pulse">
        <FaShieldAlt size={120} />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
        403 - Доступ заборонено
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Вибачте, але у вас немає прав для перегляду цієї сторінки. Ця закрита зона призначена лише для адміністраторів.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        Повернутися в магазин
      </Link>
    </div>
  );
};

export default Forbidden;
