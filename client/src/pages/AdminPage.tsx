import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { API_BASE_URL } from '../constants';
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight, FaFolder } from 'react-icons/fa';


interface PagedResponse {
    items: Product[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
}

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Стан для пагінації
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Запитуємо конкретну сторінку, по 10 товарів
        const res = await axios.get<PagedResponse>(
            `${API_BASE_URL}/api/products?page=${currentPage}&pageSize=10`
        );
        
        // Бекенд тепер повертає PagedResult, тому беремо .items
        setProducts(res.data.items);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Помилка завантаження товарів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshKey, currentPage]); // Залежить від оновлення даних АБО зміни сторінки

  const handleDelete = async (id: number) => {
    if (window.confirm('Видалити цей товар?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`);
        setRefreshKey(prev => prev + 1); // Перезавантажити список
      } catch (error) {
        console.error("Помилка видалення:", error);
        alert("Не вдалося видалити товар");
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* --- ВЕРХНЯ ПАНЕЛЬ --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Адмін-панель</h1>
        
        <div className="flex gap-3">
            {/* НОВА КНОПКА: Перехід до категорій */}
            <Link 
              to="/admin/categories" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
            >
              <FaFolder /> Категорії
            </Link>

            {/* Стара кнопка: Додати товар */}
            <Link 
              to="/admin/products/new" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition shadow-md"
            >
              <FaPlus /> Додати товар
            </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
            <div className="p-10 text-center text-gray-500">Завантаження...</div>
        ) : (
            <>
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категорія</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Склад</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.categoryName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.price} грн</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {product.stockQuantity} шт.
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4 inline-block" title="Редагувати">
                            <FaEdit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 inline-block" title="Видалити">
                            <FaTrash size={18} />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>

                {/* --- НИЖНЯ ПАНЕЛЬ З ПАГІНАЦІЄЮ --- */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                        Сторінка <span className="font-medium">{currentPage}</span> з <span className="font-medium">{totalPages}</span>
                    </span>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-300 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-white hover:text-blue-600'}`}
                        >
                            <FaChevronLeft />
                        </button>
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-white hover:text-blue-600'}`}
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;