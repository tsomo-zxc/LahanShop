import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import type { Category } from '../types';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Помилка:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Видалити цю категорію?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
        fetchCategories();
      } catch (error: any) {
        // Виводимо повідомлення від сервера (наприклад, "є товари")
        alert(error.response?.data || "Не вдалося видалити категорію.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
        {/* Кнопка НАЗАД */}
      <div className="mb-6">
        <Link to="/admin" className="text-gray-600 hover:text-blue-600 flex items-center gap-2 font-medium">
            <FaArrowLeft /> Назад до Товарів
        </Link>
      </div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Категорії</h1>
        <Link to="/admin/categories/new" className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <FaPlus /> Додати категорію
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Батьківська категорія</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товарів</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{cat.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                    {cat.parentName || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {cat.productsCount}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/categories/edit/${cat.id}`} className="text-blue-600 hover:text-blue-900 mr-4 inline-block">
                    <FaEdit size={18} />
                  </Link>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900 inline-block">
                    <FaTrash size={18} />
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

export default AdminCategoriesPage;