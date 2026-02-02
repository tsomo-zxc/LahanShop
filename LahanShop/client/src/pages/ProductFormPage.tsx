import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios  from 'axios';
import { API_BASE_URL } from '../constants';
import type { Category } from '../types';
import { FaPlus, FaTrash } from 'react-icons/fa'; // Іконки для характеристик

// Інтерфейс для одного рядка характеристики в UI
interface SpecItem {
  key: string;
  value: string;
}

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  
  // Основні поля форми
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: ''
  });

  // Стан для Характеристик (UI)
  const [specs, setSpecs] = useState<SpecItem[]>([]);

  useEffect(() => {
    // 1. Завантаження категорій
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories`);
        setCategories(Array.isArray(res.data) ? res.data : []); 
      } catch (err) {
        console.error("Помилка категорій", err);
      }
    };
    fetchCategories();
    
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
            const p = res.data;
            
            setFormData({
                name: p.name,
                description: p.description,
                price: p.price.toString(),
                stockQuantity: p.stockQuantity.toString(),
                categoryId: p.categoryId ? p.categoryId.toString() : ''
            });

            // --- БЕЗПЕЧНИЙ ПАРСИНГ JSON ---
            if (p.specifications) {
                try {
                    // Перевіряємо, чи схоже це на JSON (починається з {)
                    if (p.specifications.trim().startsWith('{')) {
                        const parsed = JSON.parse(p.specifications);
                        const specsArray = Object.entries(parsed).map(([key, value]) => ({
                            key,
                            value: String(value)
                        }));
                        setSpecs(specsArray);
                    } else {
                        // Якщо це не JSON, а просто текст - ігноруємо
                        console.warn("Дані специфікації не є JSON, пропускаємо.");
                        setSpecs([]); 
                    }
                } catch (e) {
                    console.warn("Пошкоджений JSON у базі даних, характеристики очищено.",e);
                    setSpecs([]);
                }
            }
        } catch (error) {
            console.error("Помилка завантаження товару", error);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  // --- Функції для роботи зі специфікаціями ---

  const handleSpecChange = (index: number, field: 'key' | 'value', newValue: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = newValue;
    setSpecs(newSpecs);
  };

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    setSpecs(newSpecs);
  };

  // --- Збереження ---

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Очищення та конвертація даних
    const cleanPrice = formData.price.toString().replace(',', '.');
    const finalPrice = parseFloat(cleanPrice);
    const finalStock = parseInt(formData.stockQuantity);
    const finalCategoryId = parseInt(formData.categoryId);

    // 2. Підготовка JSON характеристик
    const specsObject: Record<string, string> = {};
    specs.forEach(item => {
        if (item.key.trim()) {
            specsObject[item.key] = item.value;
        }
    });

    const jsonSpecifications = Object.keys(specsObject).length > 0 
        ? JSON.stringify(specsObject) 
        : null;

    // 3. Валідація на фронтенді
    if (!formData.name.trim()) {
        alert("Помилка: Вкажіть назву товару!");
        return;
    }
    if (isNaN(finalPrice) || finalPrice < 1) {
        alert("Помилка: Ціна має бути більше 0!");
        return;
    }
    if (isNaN(finalCategoryId) || finalCategoryId === 0) {
        alert("Помилка: Оберіть категорію зі списку!");
        return;
    }

    // --- ОСЬ ТУТ МИ СТВОРЮЄМО PAYLOAD (перед відправкою) ---
   const payload = {
        Name: formData.name,            // <--- Ключ з Великої
        Description: formData.description,
        Price: finalPrice,
        StockQuantity: finalStock || 0,
        CategoryId: finalCategoryId,
        Specifications: jsonSpecifications
    };

    console.log("Відправляємо на сервер:", payload);

    try {
      // Налаштування заголовків (щоб сервер точно зрозумів JSON)
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/products/${id}`, payload, config);
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, payload, config);
      }
      
      // Успіх -> повертаємось в адмінку
      navigate('/admin');

    } catch (error) {
      console.error("Помилка:", error);
      
      if (axios.isAxiosError(error)) {
          const serverData = error.response?.data;
          
          if (serverData?.errors) {
              const errorMsg = Object.values(serverData.errors).flat().join('\n');
              alert(`Помилка валідації:\n${errorMsg}`);
          } else if (typeof serverData === 'string') {
              alert(`Помилка сервера: ${serverData}`);
          } else {
              alert(`Помилка ${error.response?.status}: ${error.message}`);
          }
      } else {
          alert('Невідома помилка при збереженні.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Редагувати товар' : 'Новий товар'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        
        {/* --- Основні поля --- */}
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Назва</label>
                <input name="name" value={formData.name} onChange={handleChange} required 
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Опис</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ціна (грн)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required 
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Кількість</label>
                    <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required 
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Категорія</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                    <option value="">-- Оберіть категорію --</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        </div>

        <hr className="border-gray-200" />

        {/* --- Секція Характеристик (Specifications) --- */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-lg font-medium text-gray-900">Характеристики</label>
                <button type="button" onClick={addSpec} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <FaPlus /> Додати
                </button>
            </div>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                {specs.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">Характеристик немає. Натисніть "Додати".</p>
                )}

                {specs.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input 
                            placeholder="Назва (напр. Колір)" 
                            value={spec.key}
                            onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                        />
                        <input 
                            placeholder="Значення (напр. Червоний)" 
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                        />
                        <button 
                            type="button" 
                            onClick={() => removeSpec(index)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Видалити"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition shadow-md">
            Зберегти Товар
        </button>
      </form>
    </div>
  );
};

export default ProductFormPage;