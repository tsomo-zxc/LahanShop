import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../constants'; 

// Інтерфейс відповіді від сервера (такий самий, як на AdminPage)
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
  
  // Кількість товарів на головній (краще брати кратне 4, наприклад 8 або 12)
  const pageSize = 24; 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Використовуємо прямий запит, бо структура відповіді змінилась на PagedResult
        const response = await axios.get<PagedResponse>(
            `${API_BASE_URL}/api/products?page=${currentPage}&pageSize=${pageSize}`
        );

        // Бекенд тепер повертає об'єкт, товари лежать в .items
        setProducts(response.data.items);
        setTotalPages(response.data.totalPages);

        // Скрол вгору при перемиканні сторінки
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити товари. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]); // Перезавантажуємо, коли змінюється сторінка

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
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Нові надходження
        </h1>       
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
            <div className="text-center py-20 text-gray-500">
            Товари не знайдені.
            </div>
        )}
      </div>

      {/* --- БЛОК ПАГІНАЦІЇ --- */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-6 pb-8">
            {/* Кнопка НАЗАД */}
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

            {/* Номер сторінки */}
            <span className="text-gray-600 font-medium">
                Сторінка <span className="text-gray-900 font-bold">{currentPage}</span> з {totalPages}
            </span>

            {/* Кнопка ВПЕРЕД */}
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