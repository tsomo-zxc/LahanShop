import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaTrash } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import CategoryDropdown from './CategoryDropdown';
import { CURRENCY_FORMATTER, API_BASE_URL } from '../constants';

const Navbar: React.FC = () => {
  const { items, total, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <nav className=" bg-white shadow-sm fixed w-full z-50 top-0 start-0 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex h-full flex-wrap items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center rtl:space-x-reverse">
            <span className="self-center text-4xl font-bold whitespace-nowrap tracking-tight text-gray-900">
              Lahan<span className="text-blue-600">Shop</span>
            </span>
          </Link>
          <div className="hidden text-2xl md:block"> {/* Ховаємо на мобільних */}
                <CategoryDropdown />
            </div>
        </div>

        {/* Desktop Menu + Cart */}
        <div className="hidden md:flex items-center text-2xl space-x-8">
                          
          <a href="#" className=" font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Про нас
          </a>
          
          {/* Cart Dropdown Container */}
          <div className="relative" ref={cartRef}>
            <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative group cursor-pointer flex items-center justify-center focus:outline-none"
            >
               <FaShoppingCart className={`text-xl transition-colors ${isCartOpen ? 'text-blue-600' : 'text-gray-800 hover:text-blue-600'}`} />
               {itemCount > 0 && (
                 <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-short">
                   {itemCount}
                 </span>
               )}
            </button>

            {/* Dropdown Menu */}
            {isCartOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Кошик</h3>
                        <span className="text-xs text-gray-500">{itemCount} товарів</span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>Ваш кошик порожній</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {items.map(item => (
                                    <li key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                            <img 
                                                src={getImage(item.images[0]?.url)} 
                                                alt={item.name} 
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3 className="line-clamp-1 mr-2"><Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)}>{item.name}</Link></h3>
                                                    <p className="ml-4">{CURRENCY_FORMATTER.format(item.price)}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{item.categoryName}</p>
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <p className="text-gray-500">К-сть: {item.quantity}</p>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                                                >
                                                    <FaTrash size={12} /> Видалити
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
                            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                <p>Разом</p>
                                <p>{CURRENCY_FORMATTER.format(total)}</p>
                            </div>
                            <button 
                                className="w-full flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Оформити замовлення
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button (unchanged logic mostly, just layout) */}
        <div className="flex md:hidden items-center space-x-4">
          <div className="relative cursor-pointer" onClick={() => setIsCartOpen(!isCartOpen)}>
             <FaShoppingCart className="text-xl text-gray-800" />
             {itemCount > 0 && (
               <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                 {itemCount}
               </span>
             )}
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            type="button" 
            className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
              <span className="sr-only">Відкрити меню</span>
              {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="w-full md:hidden mt-4" id="navbar-sticky">
            <ul className="flex flex-col p-4 font-medium border border-gray-100 rounded-lg bg-gray-50 space-y-4">
              <li>
                <CategoryDropdown />
              </li>
              <li>
                
              </li>
              <li>
                <a href="#" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100" onClick={() => setIsOpen(false)}>Про нас</a>
              </li>
            </ul>
          </div>
        )}
        
        {/* Mobile Cart View (rendered below if open on mobile) */}
        {isCartOpen && (
             <div className="md:hidden w-full mt-4 border-t border-gray-200 pt-4">
                <h3 className="font-bold text-gray-900 mb-2 px-2">Ваш кошик ({itemCount})</h3>
                 {items.length === 0 ? (
                    <p className="text-gray-500 px-2 pb-2">Кошик порожній</p>
                 ) : (
                     <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                         {items.map(item => (
                             <div key={item.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                                 <div className="flex-1">
                                     <span className="text-sm font-medium">{item.name}</span>
                                     <div className="text-xs text-gray-500">{item.quantity} x {CURRENCY_FORMATTER.format(item.price)}</div>
                                 </div>
                                 <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2"><FaTrash /></button>
                             </div>
                         ))}
                         <div className="p-3 bg-gray-50 flex justify-between items-center rounded-b-lg">
                             <span className="font-bold">Разом: {CURRENCY_FORMATTER.format(total)}</span>
                         </div>
                     </div>
                 )}
             </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;