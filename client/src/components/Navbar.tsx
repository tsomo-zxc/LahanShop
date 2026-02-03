import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 👇 Додали хуки
import { FaShoppingCart, FaBars, FaTimes, FaTrash, FaSearch } from 'react-icons/fa'; // 👇 Додали FaSearch
import { useCart } from '../context/CartContext';
import CategoryDropdown from './CategoryDropdown';
import { CURRENCY_FORMATTER, API_BASE_URL } from '../constants';

const Navbar: React.FC = () => {
  const { items, total, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // 👇 Стан для пошуку
  const [searchTerm, setSearchTerm] = useState('');
  
  const cartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Щоб знати поточну URL адресу
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Close cart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getImage = (url: string) => {
      if (!url) return "https://picsum.photos/100/100?grayscale";
      return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  };

  // 👇 ГОЛОВНА ЛОГІКА ПОШУКУ
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Щоб сторінка не перезавантажилась стандартно

    // 1. Перевіряємо, чи ми зараз всередині категорії (наприклад /category/5)
    // Регулярний вираз шукає цифри після "/category/"
    const categoryMatch = location.pathname.match(/^\/category\/(\d+)/);
    const currentCategoryId = categoryMatch ? categoryMatch[1] : null;

    // 2. Формуємо параметри запиту
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
    }
    
    // Якщо ми в категорії — додаємо її ID до пошуку
    if (currentCategoryId) {
        params.set('categoryId', currentCategoryId);
    }

    // 3. Переходимо на головну з параметрами
    // Вийде щось типу: /?search=Asus&categoryId=2
    navigate(`/?${params.toString()}`);
    
    // Закриваємо мобільне меню, якщо воно відкрите
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex h-24 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* --- ЛОГОТИП --- */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link to="/" className="flex items-center rtl:space-x-reverse" onClick={() => setSearchTerm('')}>
            <span className="self-center text-3xl font-extrabold whitespace-nowrap tracking-tight text-gray-900">
              Lahan<span className="text-blue-600">Shop</span>
            </span>
          </Link>
          
          {/* Дропдаун категорій (тільки ПК) */}
          <div className="hidden md:block relative z-50"> 
             <CategoryDropdown />
          </div>
        </div>

        {/* --- ПОШУК (ЦЕНТРАЛЬНА ЧАСТИНА - ТІЛЬКИ ПК) --- */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="w-full relative group">
                <input 
                    type="text" 
                    placeholder={location.pathname.includes('/category/') ? "Пошук у цій категорії..." : "Я шукаю..."}
                    className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 focus:bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                >
                    <FaSearch size={14} />
                </button>
            </form>
        </div>

        {/* --- ПРАВА ЧАСТИНА (МЕНЮ + КОШИК) --- */}
        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
          
          {/* Посилання (Тільки ПК) */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Про нас
            </a>
          </div>
          
          {/* Кошик */}
          <div className="relative" ref={cartRef}>
            <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative group cursor-pointer flex items-center justify-center focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-all"
            >
               <FaShoppingCart className={`text-xl transition-colors ${isCartOpen ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`} />
               {itemCount > 0 && (
                 <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">
                   {itemCount}
                 </span>
               )}
            </button>

            {/* Dropdown Menu Кошика */}
            {isCartOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Кошик</h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">{itemCount} товарів</span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <FaShoppingCart className="text-4xl text-gray-200 mb-2" />
                                <p>Ваш кошик порожній</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {items.map(item => (
                                    <li key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                                            <img 
                                                src={getImage(item.images[0]?.url)} 
                                                alt={item.name} 
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between text-sm font-medium text-gray-900">
                                                    <h3 className="line-clamp-1 mr-2 hover:text-blue-600">
                                                        <Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)}>{item.name}</Link>
                                                    </h3>
                                                    <p>{CURRENCY_FORMATTER.format(item.price)}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.categoryName}</p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-2">
                                                <p className="text-gray-500 text-xs">К-сть: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="font-medium text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Видалити"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                            <div className="flex justify-between text-base font-bold text-gray-900 mb-4">
                                <p>Разом</p>
                                <p className="text-blue-600">{CURRENCY_FORMATTER.format(total)}</p>
                            </div>
                            <button 
                                className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98]"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Оформити замовлення
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            type="button" 
            className="md:hidden inline-flex items-center justify-center p-2 w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
              <span className="sr-only">Відкрити меню</span>
              {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            
            {/* Пошук (Мобільний) */}
            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Пошук товарів..." 
                    className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaSearch />
                </button>
            </form>

            <div className="font-medium text-gray-900">Категорії</div>
            <div className="pl-2">
                <CategoryDropdown />
            </div>
            
            <hr className="border-gray-100" />
            
            <a href="#" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                Про нас
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;