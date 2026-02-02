import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import type { Category } from '../types';

const CategoryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    parentId: '' // Зберігаємо як рядок для select, але відправляємо int
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // 1. Завантажуємо всі категорії (для списку батьків)
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();

    // 2. Якщо редагуємо - завантажуємо дані поточної
    if (isEditMode) {
      const fetchCurrent = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/categories/${id}`);
            const data = res.data;
            setFormData({
                name: data.name,
                parentId: data.parentId ? data.parentId.toString() : ''
            });
        } catch (error) {
            console.error("Не вдалося завантажити категорію", error);
        }
      };
      fetchCurrent();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Підготовка даних (PascalCase для C#)
    const payload = {
        Name: formData.name,
        ParentId: formData.parentId ? parseInt(formData.parentId) : null
    };

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/categories/${id}`, payload, config);
      } else {
        await axios.post(`${API_BASE_URL}/api/categories`, payload, config);
      }
      navigate('/admin/categories');
    } catch (error: any) {
      alert("Помилка збереження: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Редагувати категорію' : 'Нова категорія'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Назва категорії</label>
            <input 
                name="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Батьківська категорія</label>
            <select 
                name="parentId" 
                value={formData.parentId} 
                onChange={e => setFormData({...formData, parentId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
            >
                <option value="">-- Головна категорія (без батька) --</option>
                {categories
                    // Фільтруємо: категорія не може бути батьком сама собі
                    .filter(c => c.id !== Number(id)) 
                    .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name} (ID: {cat.id})
                        </option>
                ))}
            </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
            Зберегти
        </button>
      </form>
    </div>
  );
};

export default CategoryFormPage;