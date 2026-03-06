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
  FaUserPlus,
  FaPhoneAlt
} from 'react-icons/fa';
import CategoryDropdown from './CategoryDropdown';

import { getNewOrdersCount } from '../services/orders';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Ref для відстеження кліків поза меню
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchCount = async () => {
      if (isAuthenticated && isAdmin) {
        try {
          const count = await getNewOrdersCount();
          setNewOrdersCount(count);
        } catch (error) {
          console.error("Не вдалося отримати лічильник замовлень");
        }
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchCount(); // Перший запуск одразу
      // Запускаємо перевірку кожні 30 секунд (щоб бачити нові замовлення без оновлення сторінки)
      interval = setInterval(fetchCount, 30000);
    }

    return () => clearInterval(interval); // Чистимо таймер при виході
  }, [isAuthenticated, isAdmin]);
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
      {/* Top Bar */}
      <div className="hidden md:flex bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center text-xs text-gray-600">
          {/* Ліва частина */}
          <div className="flex items-center gap-6">
            <a href="tel:+380991234567" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" title="Зателефонувати">
              <FaPhoneAlt />
              <span>+38 (099) 123-45-67</span>
            </a>
            <a href="tel:+380987654321" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" title="Зателефонувати">
              <FaPhoneAlt />
              <span>+38 (098) 765-43-21</span>
            </a>
          </div>

          {/* Права частина */}
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-blue-600 transition-colors font-medium" title="Про нас" onClick={() => window.scrollTo(0, 0)}>
              Про нас
            </Link>
            <Link to="/info" className="hover:text-blue-600 transition-colors font-medium" title="Додаткова інформація" onClick={() => window.scrollTo(0, 0)}>
              Додаткова інформація
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0 min-h-[5rem] sm:h-32 flex flex-wrap items-center justify-between gap-y-3 gap-x-4 sm:gap-8">

        {/* 1. Логотип */}
        <Link to="/" className="flex-shrink-0 flex items-center order-1" title='Логотип' onClick={closeMenu}>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight uppercase leading-none">
              Авторозбірка
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-600 tracking-tight uppercase leading-none">
              Стадники
            </span>
          </div>
        </Link>

        {/* 2 & 3. Каталог і Пошук */}
        <div className="w-full sm:w-auto sm:flex-1 flex items-center gap-2 sm:gap-4 order-3 sm:order-2 mt-1 sm:mt-0 z-40">
          {/* 2. Каталог (Дропдаун категорій) */}
          <div className="relative">
            <CategoryDropdown />
          </div>

          {/* 3. Пошук (по центру, розтягується) */}
          <form onSubmit={handleSearch} className="flex-grow max-w-xl relative">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl py-2 sm:py-2.5 pl-4 sm:pl-5 pr-10 sm:pr-12 text-sm sm:text-base text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                placeholder="Я шукаю..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors block"
                title="Шукати"
              >
                <FaSearch size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* 4. Права частина (Кошик + Меню користувача) */}
        <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3">

          {/* --- КОШИК --- */}
          <Link
            to="/cart"
            className="relative text-gray-600 hover:text-blue-600 transition-colors p-2"
            onClick={closeMenu}
            title="Кошик"
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
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden"
              title="Меню користувача"
            >
              {isAuthenticated && user?.fullName ? (
                <span className="text-sm font-bold uppercase select-none">
                  {user.fullName.trim().substring(0, 2)}
                </span>
              ) : (
                <FaUser size={20} />
              )}
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
                      <>
                        {/* Розділювач, щоб відділити особисте від адмінського */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Маленький заголовок (опціонально, для краси) */}
                        <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Адмін зона
                        </p>

                        {/* Кнопка "Всі замовлення" */}
                        <Link
                          to="/admin/orders"
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={closeMenu}
                          title="Управління замовленнями"
                        >
                          <div className="flex items-center">
                            <FaTools className="mr-3 text-gray-400" />
                            Управління замовленнями
                          </div>

                          {/* 👇 ЧЕРВОНИЙ КРУЖЕЧОК (BADGE) */}
                          {newOrdersCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                              +{newOrdersCount}
                            </span>
                          )}
                        </Link>

                        {/* Кнопка "Головна панель" (якщо треба повернутись до створення товарів) */}
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={closeMenu}
                          title="Панель товарів"
                        >
                          <FaTools className="mr-3 text-blue-500" />
                          Панель товарів
                        </Link>
                        <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Зона користувача
                        </p>

                      </>

                    )}

                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenu}
                      title="Мої замовлення"
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
                      title="Вийти з акаунту"
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
                      title="Увійти в акаунт"
                    >
                      <FaSignInAlt className="mr-3 text-gray-400" /> Вхід
                    </Link>

                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={closeMenu}
                      title="Зареєструватися"
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