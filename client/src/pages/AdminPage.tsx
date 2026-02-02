import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { API_BASE_URL } from '../constants';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  // ВИПРАВЛЕННЯ: Використовуємо просте число (0), а не Date.now()
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products?pageSize=100`);
        setProducts(res.data.items || res.data);
      } catch (error) {
        console.error("Помилка завантаження товарів:", error);
      }
    };

    fetchProducts();
  }, [refreshKey]); // <--- Слідкуємо за зміною лічильника

  const handleDelete = async (id: number) => {
    if (window.confirm('Видалити цей товар?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`);
        
        // ВИПРАВЛЕННЯ: Просто збільшуємо лічильник на 1
        // Це змусить useEffect запуститись знову
        setRefreshKey(prev => prev + 1); 
        
      } catch (error) {
        console.error("Помилка видалення:", error);
        alert("Не вдалося видалити товар");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Адмін-панель</h1>
        <Link to="/admin/products/new" className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <FaPlus /> Додати товар
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категорія</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Склад</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.categoryName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.price} грн</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stockQuantity} шт.
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    <FaEdit className="inline" />
                  </Link>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                    <FaTrash className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;