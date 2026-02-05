import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSignInAlt, FaTools, FaSearch } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(''); // Очистити поле після пошуку (опціонально)
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      {/* Висота h-32 (128px), як ви просили раніше */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-32 flex items-center justify-between gap-8">
        
        {/* 1. Логотип */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Lahan<span className="text-blue-600">Shop</span>
          </span>
        </Link>

        {/* 2. Пошук (по центру) */}
        <form onSubmit={handleSearch} className="flex-grow max-w-2xl relative">
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-full py-3 pl-5 pr-12 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
              placeholder="Я шукаю..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
                <FaSearch size={18} />
            </button>
          </div>
        </form>

        {/* 3. Меню праворуч */}
        <div className="flex items-center gap-6">
          
          {/* Якщо користувач АВТОРИЗОВАНИЙ */}
          {isAuthenticated ? (
            <>
              {/* Кнопка Адмінки (Тільки для Адміна) */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <div className="bg-gray-100 p-2 rounded-full group-hover:bg-red-50">
                    <FaTools size={20} />
                  </div>
                  <span className="text-xs font-medium mt-1">Адмінка</span>
                </Link>
              )}

              {/* Інфо про юзера */}
              <div className="flex flex-col items-center text-gray-600">
                  <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                    <FaUser size={20} />
                  </div>
                  <span className="text-xs font-medium mt-1 max-w-[100px] truncate">
                    {user?.fullName || "Користувач"}
                  </span>
              </div>

              {/* Кнопка Вийти */}
              <button 
                onClick={logout} 
                className="flex flex-col items-center text-gray-400 hover:text-gray-800 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-gray-100">
                    <FaSignOutAlt size={20} />
                </div>
                <span className="text-xs font-medium mt-1">Вийти</span>
              </button>
            </>
          ) : (
            /* Якщо ГІСТЬ (Не авторизований) */
            <div className="flex items-center gap-4">
               <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2">
                  <FaSignInAlt /> Вхід
               </Link>
               <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
               >
                  Реєстрація
               </Link>
            </div>
          )}

          {/* Кошик (завжди видимий, поки що просто іконка) */}
          <Link to="/cart" className="relative flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
            <div className="relative">
                <FaShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    0
                </span>
            </div>
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;