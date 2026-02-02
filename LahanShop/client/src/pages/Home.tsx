import React, { useEffect, useState } from 'react';
import axios from 'axios';
// 👇 Додали FaSearch
import { FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../constants';

interface PagedResponse {
  items: Product[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Стан для пагінації
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 👇 Стан для пошуку
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  const pageSize = 8; 

  // 1. Ефект затримки (Debounce): чекаємо 500мс після вводу тексту
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedTerm(searchTerm);
        setCurrentPage(1); // При новому пошуку завжди йдемо на 1-шу сторінку
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Завантаження товарів
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // 👇 Додали &searchTerm=${debouncedTerm}
        const response = await axios.get<PagedResponse>(
            `${API_BASE_URL}/api/products?page=${currentPage}&pageSize=${pageSize}&searchTerm=${debouncedTerm}`
        );

        setProducts(response.data.items);
        setTotalPages(response.data.totalPages);

        // Скрол вгору при перемиканні сторінки (але не при пошуку, щоб не стрибало)
        if (debouncedTerm === searchTerm) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити товари. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, debouncedTerm]); // 👇 Залежить від сторінки ТА пошуку

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Помилка</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16 min-h-screen flex flex-col">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Каталог товарів
        </h1>
        
        {/* 👇 ПОЛЕ ПОШУКУ (Красиве, по центру) */}
        <div className="relative max-w-lg mx-auto">
            <input 
                type="text"
                placeholder="Я шукаю..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            />
            <FaSearch className="absolute left-4 top-4 text-gray-400 text-lg" />
        </div>
      </div>

      <div className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
            <div key={product.id} className="flex justify-center sm:justify-start">
                <ProductCard product={product} />
            </div>
            ))}
        </div>
        
        {products.length === 0 && (
            <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Товарів за запитом "{searchTerm}" не знайдено.</p>
                <button 
                    onClick={() => setSearchTerm('')} 
                    className="mt-4 text-blue-600 hover:underline font-medium"
                >
                    Показати всі товари
                </button>
            </div>
        )}
      </div>

      {/* --- БЛОК ПАГІНАЦІЇ --- */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-6 pb-8">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border font-semibold transition-all shadow-sm
                ${currentPage === 1 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                    : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
            >
                <FaChevronLeft /> Попередня
            </button>

            <span className="text-gray-600 font-medium">
                Сторінка <span className="text-gray-900 font-bold">{currentPage}</span> з {totalPages}
            </span>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border font-semibold transition-all shadow-sm
                ${currentPage === totalPages 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                    : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
            >
                Наступна <FaChevronRight />
            </button>
        </div>
      )}
    </div>
  );
};

export default Home;