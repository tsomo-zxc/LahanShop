import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/axiosInstance';
import type { Category, CategorySpecTemplate, ProductImage } from '../types';
import { FaTrash, FaPlus, FaMagic,FaArrowLeft, FaUpload } from 'react-icons/fa';

interface SpecItem {
    key: string;
    value: string;
}

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stockQuantity: ''
  });

  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 1. ЗАВАНТАЖЕННЯ ДАНИХ (Виправлено парсинг)
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await api.get(`/api/categories`);
            setCategories(res.data);
        } catch (e) { console.error(e); }
    };
    fetchCategories();

    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/api/products/${id}`);
          const p = res.data;
          
          setFormData({
            name: p.name,
            description: p.description,
            price: p.price.toString(),
            categoryId: p.categoryId.toString(),
            stockQuantity: p.stockQuantity.toString()
          });

          // 👇 ВИПРАВЛЕНО: Парсимо об'єкт {"Key":"Value"} назад у масив для форми
          if (p.specifications) {
              try {
                  const parsed = JSON.parse(p.specifications);
                  
                  if (Array.isArray(parsed)) {
                      // Якщо раптом в базі старий формат масиву
                      setSpecs(parsed);
                  } else if (typeof parsed === 'object') {
                      // 👇 Якщо це ваш правильний формат об'єкта
                      // Перетворюємо {"Колір":"Чорний"} -> [{key:"Колір", value:"Чорний"}]
                      const mappedSpecs = Object.entries(parsed).map(([key, value]) => ({
                          key: key,
                          value: String(value)
                      }));
                      setSpecs(mappedSpecs);
                  }
              } catch (e) {
                  // Якщо просто текст
                  console.error(e);
                  setSpecs([{ key: "Опис", value: p.specifications }]);
              }
          }

          if (p.images) {
             setImages(p.images.map((img: ProductImage) => img.url));
          }
        } catch (error) {
          console.error("Помилка завантаження товару", error);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  // 2. Шаблони (залишається без змін, воно працює з UI масивом)
  const loadCategoryTemplates = async (catId: string) => {
      if (!catId) return;
      try {
          const res = await api.get(`/api/CategorySpecs/category/${catId}`);
          const templates = res.data; 

          setSpecs(prevSpecs => {
              const newSpecs = [...prevSpecs];
              templates.forEach((tmpl: CategorySpecTemplate) => {
                  const exists = newSpecs.some(s => s.key.toLowerCase() === tmpl.name.toLowerCase());
                  if (!exists) {
                      newSpecs.push({ key: tmpl.name, value: "" });
                  }
              });
              return newSpecs;
          });
      } catch (error) {
          console.error("Не вдалося завантажити шаблони", error);
      }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCatId = e.target.value;
      setFormData({ ...formData, categoryId: newCatId });
      if (newCatId) loadCategoryTemplates(newCatId);
  };

  // 3. ЗБЕРЕЖЕННЯ (Виправлено формат JSON)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 👇 ВИПРАВЛЕНО: Конвертуємо масив UI у простий об'єкт {"Ключ": "Значення"}
    const specsObject: Record<string, string> = {};
    
    specs.forEach(item => {
        if (item.key.trim() !== "") {
            specsObject[item.key.trim()] = item.value.trim();
        }
    });

    // Тепер це буде {"Колір":"Чорний", "Вага":"1кг"} замість масиву
    const specsJson = JSON.stringify(specsObject);
    

    const formPayload = new FormData();
    formPayload.append('Name', formData.name);
    formPayload.append('Description', formData.description);
    formPayload.append('Price', formData.price.toString());
    formPayload.append('StockQuantity', formData.stockQuantity.toString());
    formPayload.append('CategoryId', formData.categoryId.toString());
    formPayload.append('Specifications', specsJson);

    images.forEach((url) => {
        formPayload.append('ImageUrls', url); // Якщо у Dto є такий полі - варто узгодити
    });

    imageFiles.forEach((file) => {
        formPayload.append('Images', file); // Тут найважливіша зміна
    });

    try {
        if (isEditMode) {
            await api.put(`/api/products/${id}`, formPayload);
            alert("Товар оновлено!");
        } else {
            await api.post(`/api/products`, formPayload);
            alert("Товар створено!");
            navigate('/admin');
        }
    } catch (error: any) {
        console.error("Повна помилка:", error.response?.data || error);
        
        let errorMessage = "Помилка збереження!";
        if (error.response?.data?.errors) {
            // ASP.NET Core ValidationProblemDetails
            const validationErrors = Object.entries(error.response.data.errors)
                .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
                .join('\n');
            errorMessage += `\n\nДеталі валідації:\n${validationErrors}`;
        } else if (error.response?.data) {
            errorMessage += `\n\nДеталі:\n${JSON.stringify(error.response.data)}`;
        }
        
        alert(errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
      const newFiles = [...imageFiles];
      newFiles.splice(index, 1);
      setImageFiles(newFiles);

      const newPreviews = [...imagePreviews];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
      setImages(images.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', newValue: string) => {
      const newSpecs = [...specs];
      newSpecs[index][field] = newValue;
      setSpecs(newSpecs);
  };

  const removeSpec = (index: number) => {
      setSpecs(specs.filter((_, i) => i !== index));
  };

  const addEmptySpec = () => {
      setSpecs([...specs, { key: '', value: '' }]);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-6">
        <Link to="/admin" className="text-gray-600 hover:text-blue-600 flex items-center gap-2 font-medium">
            <FaArrowLeft /> Назад до Продуктів
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Редагувати товар' : 'Новий товар'}</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ЛІВА КОЛОНКА */}
        <div className="space-y-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold border-b pb-2">Основна інформація</h2>
            <div>
                <label className="block text-sm font-medium">Назва товару</label>
                <input className="w-full border p-2 rounded mt-1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Ціна (грн)</label>
                    <input type="number" className="w-full border p-2 rounded mt-1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Кількість</label>
                    <input type="number" className="w-full border p-2 rounded mt-1" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Категорія</label>
                <div className="flex gap-2">
                    <select className="w-full border p-2 rounded mt-1 bg-white" value={formData.categoryId} onChange={handleCategoryChange} required >
                        <option value="">-- Оберіть категорію --</option>
                        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                    <button type="button" title="Загрузити шаблон характеристик" onClick={() => loadCategoryTemplates(formData.categoryId)} className="mt-1 bg-gray-100 p-2 rounded text-blue-600"><FaMagic /></button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Опис</label>
                <textarea className="w-full border p-2 rounded mt-1 h-64" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
        </div>

        {/* ПРАВА КОЛОНКА */}
        <div className="space-y-6">
            {/* Характеристики */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-lg font-semibold">Характеристики</h2>
                    <button type="button" onClick={addEmptySpec} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><FaPlus /> Додати поле</button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {specs.map((spec, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input placeholder="Назва" className="w-1/3 border p-2 rounded text-sm bg-gray-50 font-medium" value={spec.key} onChange={(e) => updateSpec(index, 'key', e.target.value)} />
                            <input placeholder="Значення" className="flex-1 border p-2 rounded text-sm" value={spec.value} onChange={(e) => updateSpec(index, 'value', e.target.value)} />
                            <button type="button" onClick={() => removeSpec(index)} className="text-gray-400 hover:text-red-500"><FaTrash /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Фото */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold border-b pb-2 mb-4">Зображення</h2>
                
                {/* Drag & Drop / Upload Zone */}
                <div className="flex items-center justify-center w-full mb-6">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <FaUpload className="w-8 h-8 mb-3 text-blue-500" />
                            <p className="mb-2 text-sm text-gray-600"><span className="font-semibold text-blue-600">Натисніть для завантаження</span> або перетягніть файли сюди</p>
                            <p className="text-xs text-gray-500">Дозволені формати: JPG, PNG, WEBP (кілька файлів)</p>
                        </div>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                {/* Grid for Previews */}
                {(imagePreviews.length > 0 || images.length > 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Existing Images (from Edit Mode) */}
                        {images.map((img, idx) => (
                            <div key={`existing-${idx}`} className="relative group border rounded-lg overflow-hidden h-28 shadow-sm">
                                <img src={img} alt="Existing" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg"></div>
                                <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><FaTrash size={12} /></button>
                            </div>
                        ))}
                        
                        {/* New Images */}
                        {imagePreviews.map((preview, idx) => (
                            <div key={`new-${idx}`} className="relative group border border-blue-200 rounded-lg overflow-hidden h-28 shadow-sm bg-gray-50">
                                <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg"></div>
                                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><FaTrash size={12} /></button>
                                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow opacity-90">Нове</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-bold hover:bg-blue-700 shadow-lg transition transform active:scale-[0.98]">
                {isEditMode ? 'Зберегти зміни' : 'Створити товар'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;