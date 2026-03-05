import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { FaBars, FaChevronRight, FaCar } from 'react-icons/fa';
import api from '../services/axiosInstance';

// --- РЕКУРСИВНИЙ КОМПОНЕНТ ---
const CategoryItem = ({ category, depth = 0 }: { category: Category; depth?: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasChildren = category.children && category.children.length > 0;

  useEffect(() => {
    if (isHovered && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      // Якщо меню виходить за межі екрану справа, відкриваємо його наліво
      if (rect.right > window.innerWidth - 20) {
        setOpenLeft(true);
      }
    } else if (!isHovered) {
      setOpenLeft(false);
    }
  }, [isHovered]);

  // Вираховуємо стилі залежно від глибини вкладеності (для мобільних)
  const getDepthStyles = () => {
    if (depth === 0) return "text-base font-medium";
    if (depth === 1) return "text-[15px] font-medium text-gray-700";
    if (depth === 2) return "text-sm text-gray-600";
    return "text-[13px] text-gray-500"; // Для 3+ рівня
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Каталог"
    >
      {/* Контейнер посилання та кнопки розгортання для мобільних */}
      <div className={`flex items-center justify-between transition first:rounded-t-lg last:rounded-b-lg ${isHovered || isMobileOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>
        <Link
          to={`/category/${category.id}`}
          className={`flex-grow px-5 py-3 ${getDepthStyles()}`}
          title={category.name}
        >
          {category.name}
        </Link>

        {/* Стрілочка розгортання */}
        {hasChildren && (
          <button
            type="button"
            className="p-3 mr-1 text-gray-400 hover:text-blue-600"
            onClick={(e) => {
              e.preventDefault();
              setIsMobileOpen(!isMobileOpen);
            }}
          >
            <FaChevronRight size={12} className={`transition-transform duration-200 ${(isMobileOpen || isHovered) ? 'md:rotate-0' : ''} ${isMobileOpen ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* ВИПАДАЮЧИЙ СПИСОК */}
      {hasChildren && (
        <>
          {/* Десктоп версія */}
          {isHovered && (
            <div
              ref={menuRef}
              className={`hidden md:block absolute top-0 w-64 z-50 ${openLeft ? 'right-full -mr-1 pr-1' : 'left-full -ml-1 pl-1'}`}
            >
              <div className="bg-white shadow-xl rounded-lg border border-gray-100 py-2">
                {category.children!.map((child) => (
                  <CategoryItem key={child.id} category={child} />
                ))}
              </div>
            </div>
          )}

          {/* Мобільна версія (акордеон) */}
          {isMobileOpen && (
            <div className="md:hidden w-full relative bg-blue-50/20">
              {/* Візуальна лінія ієрархії */}
              <div className="border-l-2 border-blue-200/50 hover:border-blue-300 transition-colors ml-4 pl-1 py-1">
                {category.children!.map((child) => (
                  <CategoryItem key={child.id} category={child} depth={depth + 1} />
                ))}
              </div>
            </div>
          )}
        </>
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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-base sm:text-lg font-medium hover:bg-blue-700 transition shadow-md"
      >
        <FaBars />
        <span className="hidden sm:inline">Каталог</span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%)] left-0 w-[280px] sm:w-[320px] max-h-[80vh] md:max-h-none overflow-y-auto overflow-x-hidden md:overflow-visible bg-white shadow-2xl rounded-lg border border-gray-100 py-3 z-50">
          {loading ? (
            <div className="px-5 py-4 text-gray-500 text-center">Завантаження...</div>
          ) : (
            <div className="flex flex-col">
              {categories.map((category) => (
                <div key={category.id} className="mb-2 border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                  <Link
                    to={`/category/${category.id}`}
                    className="flex items-center px-5 py-2 text-gray-800 hover:text-blue-600 transition-colors"
                    title={category.name}
                  >
                    {category.id === 1 && (
                      <img src="/Ford_logo.svg" alt="Ford" className="w-8 h-8 mr-3 object-contain" />
                    )}
                    {category.id === 2 && (
                      <img src="/Renault_logo.svg" alt="Renault" className="w-8 h-8 mr-3 object-contain" />
                    )}
                    {category.id === 3 && (
                      <FaCar className="w-8 h-8 mr-3 text-gray-500" />
                    )}
                    <span className="text-lg font-bold tracking-wide uppercase">
                      {category.name}
                    </span>
                  </Link>
                  <div className="flex flex-col">
                    {category.children?.map(child => (
                      <CategoryItem key={child.id} category={child} depth={1} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;