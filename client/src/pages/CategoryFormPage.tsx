import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../services/axiosInstance';
import type { Category } from '../types';
import { FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

interface CategorySpec {
    id: number;
    name: string;
    categoryId: number;
}

const CategoryFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        parentId: ''
    });

    const [categories, setCategories] = useState<Category[]>([]);

    const [specs, setSpecs] = useState<CategorySpec[]>([]);
    const [newSpecName, setNewSpecName] = useState('');
    const [specsLoading, setSpecsLoading] = useState(false);

    // 1. Loading data
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get(`/api/categories`);
                setCategories(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();

        if (isEditMode) {
            const fetchCurrentCategory = async () => {
                try {
                    const res = await api.get(`/api/categories/${id}`);
                    setFormData({
                        name: res.data.name,
                        parentId: res.data.parentId ? res.data.parentId.toString() : ''
                    });
                } catch (error) {
                    console.error(error);
                }
            };
            fetchCurrentCategory();

            fetchSpecs();
        }
    }, [id, isEditMode]);

    // Loading characteristics
    const fetchSpecs = async () => {
        try {
            setSpecsLoading(true);
            const res = await api.get(`/api/CategorySpecs/category/${id}`);
            setSpecs(res.data);
        } catch (error) {
            console.error("Не вдалося завантажити характеристики", error);
        } finally {
            setSpecsLoading(false);
        }
    };

    // Saving category
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            Name: formData.name,
            ParentId: formData.parentId ? parseInt(formData.parentId) : null
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            if (isEditMode) {
                await api.put(`/api/categories/${id}`, payload, config);
                alert("Категорію оновлено!");
            } else {
                // When creating a new one - redirect to edit to add specs
                const res = await api.post(`/api/categories`, payload, config);
                const newId = res.data.id;
                if (window.confirm("Категорію створено! Перейти до додавання характеристик?")) {
                    navigate(`/admin/categories/edit/${newId}`);
                } else {
                    navigate('/admin/categories');
                }
            }
        } catch (error) {
            let message = "Щось пішло не так";

            // 3. Checking if it's an Axios error (from server)
            if (axios.isAxiosError(error)) {
                // Now TypeScript knows that error has .response
                // You can specify that we expect { message: string } from the backend
                message = error.response?.data?.message || error.message;
            }
            else if (error instanceof Error) {
                message = error.message;
            }

            console.error("Помилка: " + message);
            alert("Помилка: " + message);
        }
    };

    // Adding characteristics
    const handleAddSpec = async () => {
        if (!newSpecName.trim()) return;

        try {
            const payload = {
                Name: newSpecName,
                CategoryId: parseInt(id!)
            };

            await api.post(`/api/CategorySpecs`, payload);

            setNewSpecName('');
            fetchSpecs();
        } catch (error) {
            console.error("Не вдалося додати характеристику", error);
        }
    };

    // Deleting characteristics
    const handleDeleteSpec = async (specId: number) => {
        if (!window.confirm("Видалити цей шаблон?")) return;

        try {
            await api.delete(`/api/CategorySpecs/${specId}`);
            fetchSpecs();
        } catch (error) {
            console.error("Помилка видалення", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
            <SEO title={isEditMode ? 'Редагувати категорію' : 'Нова категорія'} />
            <div className="mb-6">
                <Link to="/admin/categories" className="text-gray-600 hover:text-blue-600 flex items-center gap-2 font-medium">
                    <FaArrowLeft /> Назад до Категорій
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Редагувати категорію' : 'Нова категорія'}</h1>

            {/*Main Information*/}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Назва категорії</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Батьківська категорія</label>
                    <select
                        name="parentId"
                        value={formData.parentId}
                        onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
                    >
                        <option value="">-- Головна категорія --</option>
                        {categories
                            .filter(c => c.id !== Number(id))
                            .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} (ID: {cat.id})
                                </option>
                            ))}
                    </select>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
                    {isEditMode ? 'Зберегти зміни' : 'Створити категорію'}
                </button>
            </form>

            {/*Specs patterns*/}
            {isEditMode && (
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Шаблони характеристик</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Додайте параметри, які мають бути у товарів цієї категорії (наприклад: "Процесор", "Діагональ").
                        При створенні товару ці поля з'являться автоматично.
                    </p>

                    {/* Form for adding specs */}
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="Назва характеристики (напр. Колір)"
                            className="flex-1 border border-gray-300 rounded-md p-2"
                            value={newSpecName}
                            onChange={(e) => setNewSpecName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()} // Додавання по Enter
                        />
                        <button
                            onClick={handleAddSpec}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            <FaPlus /> Додати
                        </button>
                    </div>

                    {/* List of specs */}
                    {specsLoading ? (
                        <p>Завантаження...</p>
                    ) : specs.length === 0 ? (
                        <p className="text-gray-400 italic">Немає шаблонів. Додайте перший!</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {specs.map((spec) => (
                                <li key={spec.id} className="py-3 flex justify-between items-center group hover:bg-gray-50 px-2 rounded">
                                    <span className="font-medium text-gray-700">{spec.name}</span>
                                    <button
                                        onClick={() => handleDeleteSpec(spec.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Видалити шаблон"
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryFormPage;