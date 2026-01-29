import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Category } from '../types'; // Або пропишіть інтерфейс тут
import {  API_BASE_URL } from '../constants';
import { FaBars, FaChevronRight } from 'react-icons/fa'; // Іконки меню та стрілочки

const CategoryDropdown = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`); // Ваш URL
        const flatCategories = response.data;
        
        // --- МАГІЯ: Перетворюємо плаский список у Дерево ---
        const tree = buildCategoryTree(flatCategories);
        setCategories(tree);
      } catch (error) {
        console.error("Не вдалося завантажити категорії", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Функція, яка збирає пазл (Батьки + Діти)
  const buildCategoryTree = (items: Category[]) => {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    // 1. Створюємо мапу всіх категорій і додаємо їм порожній масив дітей
    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    // 2. Розкладаємо по поличках
    items.forEach(item => {
      const node = map.get(item.id);
      if (item.parentId) {
        // Якщо є батько -> додаємо до батька в children
        const parent = map.get(item.parentId);
        if (parent && node) {
          parent.children?.push(node);
        }
      } else {
        // Якщо батька немає -> це головна категорія (Корінь)
        if (node) roots.push(node);
      }
    });

    return roots;
  };

  return (
    <div className="relative group pb-2" 
         onMouseEnter={() => setIsOpen(true)} 
         onMouseLeave={() => setIsOpen(false)}>
      
      {/* КНОПКА "КАТАЛОГ" */}
      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg  font-medium hover:bg-blue-700 transition">
        <FaBars />
        <span>Каталог</span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%-5px)] left-0 w-64 bg-white shadow-xl rounded-lg border border-gray-100 py-2 mt-1 z-50">
                   
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center">
              {/* Можна додати спінер, але поки просто текст */}
              <span>Завантаження...</span>
            </div>
          ) : (
            
                       <>
              {categories.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">Категорій немає</div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="group/item relative">
                    <Link 
                      to={`/category/${category.id}`}
                      className="flex items-center justify-between px-4 py-3 text-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <span>{category.name}</span>
                      {category.children && category.children.length > 0 && (
                        <FaChevronRight size={12} className="text-gray-400" />
                      )}
                    </Link>

                    {/* Підкатегорії */}
                    {category.children && category.children.length > 0 && (
                      <div className="absolute left-full top-0 w-56 bg-white shadow-xl rounded-lg border border-gray-100 py-2 hidden group-hover/item:block -ml-1 pl-4">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.id}`}
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {child.name}
                            <span className="text-xs text-gray-400 ml-1">({child.productsCount})</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;