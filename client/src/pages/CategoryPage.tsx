import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types'; // Переконайтесь, що шлях вірний
import { API_BASE_URL } from '../constants'; // Або constants
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Інтерфейс відповіді сервера
interface PagedResponse {
  items: Product[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Стани
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");
  
  // Пагінація
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Скидаємо сторінку на 1, якщо змінили категорію
  useEffect(() => {
    setCurrentPage(1);
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Додаємо параметр ?page=...
        const response = await axios.get<PagedResponse>(
            `${API_BASE_URL}/api/products/category/${id}?page=${currentPage}&pageSize=24`
        );
        
        // Тепер дані лежать в .items
        setProducts(response.data.items);
        setTotalPages(response.data.totalPages);

        if (response.data.items.length > 0) {
            setCategoryName(response.data.items[0].categoryName || "Категорія");
        } else {
            setCategoryName("Категорія");
        }
        
        // Скрол вгору при завантаженні нової сторінки
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        console.error("Помилка:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, currentPage]); // Залежить від ID та поточної сторінки

  // Обробник зміни сторінки
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen flex flex-col">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <p className="text-gray-500">Сторінка {currentPage} з {totalPages}</p>
      </div>

      <div className="flex-grow">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-500">Товарів не знайдено.</p>
          </div>
        )}
      </div>

      {/* --- ПАГІНАЦІЯ (Показуємо тільки якщо сторінок > 1) --- */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          
          {/* Кнопка НАЗАД */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all
              ${currentPage === 1 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600'}`}
          >
            <FaChevronLeft size={14} /> Попередня
          </button>

          {/* Номери сторінок (Простий варіант) */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all
                  ${currentPage === page 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Кнопка ВПЕРЕД */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all
              ${currentPage === totalPages 
                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600'}`}
          >
            Наступна <FaChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;