import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { FaBars, FaChevronRight } from 'react-icons/fa';
import api from '../services/axiosInstance';

// --- РЕКУРСИВНИЙ КОМПОНЕНТ ---
const CategoryItem = ({ category }: { category: Category }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Посилання */}
      <Link
        to={`/category/${category.id}`}
        className={`flex items-center justify-between px-5 py-3 text-base transition first:rounded-t-lg last:rounded-b-lg
          ${isHovered ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
      >
        <span className="font-medium">{category.name}</span>
        
        {/* Тільки стрілочка, якщо є підкатегорії (без цифр) */}
        {hasChildren && (
            <FaChevronRight size={12} className="text-gray-400" />
        )}
      </Link>

      {/* ВИПАДАЮЧИЙ СПИСОК (без змін) */}
      {hasChildren && isHovered && (
        <div className="absolute left-full top-0 w-64 -ml-1 pl-1 z-50">
          <div className="bg-white shadow-xl rounded-lg border border-gray-100 py-2">
            {category.children!.map((child) => (
              <CategoryItem key={child.id} category={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ ---
const CategoryDropdown = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(`/api/categories`);
        const tree = buildCategoryTree(response.data);
        setCategories(tree);
      } catch (error) {
        console.error("Помилка:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const buildCategoryTree = (items: Category[]) => {
    const map = new Map<number, Category>();
    const roots: Category[] = [];
    items.forEach(item => map.set(item.id, { ...item, children: [] }));
    items.forEach(item => {
      const node = map.get(item.id);
      if (item.parentId) {
        map.get(item.parentId)?.children?.push(node!);
      } else {
        if (node) roots.push(node);
      }
    });
    return roots;
  };

  return (
    <div className="relative" 
         onMouseEnter={() => setIsOpen(true)} 
         onMouseLeave={() => setIsOpen(false)}>
      
      <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-lg font-medium hover:bg-blue-700 transition shadow-md">
        <FaBars />
        <span>Каталог</span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%)] left-0 w-72 bg-white shadow-2xl rounded-lg border border-gray-100 py-3 z-50">
          {loading ? (
            <div className="px-5 py-4 text-gray-500 text-center">Завантаження...</div>
          ) : (
            <>
              {categories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;