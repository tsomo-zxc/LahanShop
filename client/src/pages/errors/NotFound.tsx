import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <SEO
        title="404 - Сторінка не знайдена"
        description="404 - Сторінка не знайдена"
        url="https://lahan-shop.vercel.app/404"
      />
      <h1 className="text-9xl font-extrabold text-blue-600 mb-4 animate-bounce">
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
        Ой! Здається, ви загубилися.
      </h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Сторінка, яку ви шукаєте, не існує або була видалена.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        Повернутися до покупок
      </Link>
    </div>
  );
};

export default NotFound;
