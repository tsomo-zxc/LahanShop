import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  FaShoppingCart, 
  FaUser, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaTools, 
  FaSearch, 
  FaBoxOpen, 
  FaUserPlus 
} from 'react-icons/fa';
import CategoryDropdown from './CategoryDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Ref для відстеження кліків поза меню
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закриваємо меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsUserMenuOpen(false); // Закриваємо меню якщо воно було відкрите
    }
  };

  // Функція для закриття меню при кліку на посилання
  const closeMenu = () => setIsUserMenuOpen(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-32 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* 1. Логотип */}
        <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Lahan<span className="text-blue-600">Shop</span>
          </span>
        </Link>

        {/* 2. Каталог (Дропдаун категорій) */}
        <div className="hidden md:block relative z-40"> 
             <CategoryDropdown />
        </div>

        {/* 3. Пошук (по центру, розтягується) */}
        <form onSubmit={handleSearch} className="flex-grow max-w-xl relative hidden sm:block">
          <div className="relative">
            <input              
              type="text"
              className="w-full border border-gray-300 rounded-full py-2.5 pl-5 pr-12 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
              placeholder="Я шукаю..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
            >
                <FaSearch size={16} />
            </button>
          </div>
        </form>

        {/* 4. Права частина (Кошик + Меню користувача) */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* --- КОШИК --- */}
          <Link 
            to="/cart" 
            className="relative text-gray-600 hover:text-blue-600 transition-colors p-2"
            onClick={closeMenu}
          >
            <FaShoppingCart size={24} />
            {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce shadow-sm border-2 border-white">
                    {totalItems}
                </span>
            )}
          </Link>

          {/* --- МЕНЮ КОРИСТУВАЧА (DROPDOWN) --- */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaUser size={20} />
            </button>

            {/* Вміст випадаючого меню */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all z-50">
                
                {isAuthenticated ? (
                  /* ВАРІАНТ: АВТОРИЗОВАНИЙ */
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                      <p className="text-xs text-gray-500">Ви увійшли як:</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                    </div>

                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={closeMenu}
                      >
                        <FaTools className="mr-3 text-gray-400" /> Адмін Панель
                      </Link>
                    )}

                    <Link 
                      to="/orders" 
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenu}
                    >
                      <FaBoxOpen className="mr-3 text-gray-400" /> Мої замовлення
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="mr-3" /> Вийти
                    </button>
                  </>
                ) : (
                  /* ВАРІАНТ: ГІСТЬ */
                  <>
                    <div className="px-4 py-3 text-center border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-600">Особистий кабінет</p>
                    </div>
                    
                    <Link 
                      to="/login" 
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenu}
                    >
                      <FaSignInAlt className="mr-3 text-gray-400" /> Вхід
                    </Link>

                    <Link 
                      to="/register" 
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenu}
                    >
                      <FaUserPlus className="mr-3 text-gray-400" /> Реєстрація
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;