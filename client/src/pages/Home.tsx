import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaHome, FaAngleRight } from 'react-icons/fa';
import { useSearchParams, Link } from 'react-router-dom'; 
import type { Product } from '../types';
import type {  Category } from '../types'; // Переконайтесь, що цей тип є
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../constants';

interface PagedResponse {
  items: Product[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]); // Стан для хлібних крихт
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Читаємо параметри з URL
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8; 

  // Скидаємо сторінку на 1, якщо змінився пошук або категорія
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryId]);

  // 1. ЛОГІКА ХЛІБНИХ КРИХТ (Client-side build)
  useEffect(() => {
    const buildBreadcrumbs = async () => {
      if (!categoryId) {
        setBreadcrumbs([]);
        return;
      }

      try {
        const res = await axios.get<Category[]>(`${API_BASE_URL}/api/categories`);
        const allCategories = res.data;

        const path: Category[] = [];
        let currentId: number | null = parseInt(categoryId);

        while (currentId !== null) {
            const category = allCategories.find(c => c.id === currentId);
            if (!category) break;
            path.unshift(category);
            currentId = category.parentId;
        }
        setBreadcrumbs(path);
      } catch (error) {
        console.error("Breadcrumbs error", error);
      }
    };

    buildBreadcrumbs();
  }, [categoryId]);

  // 2. ЗАВАНТАЖЕННЯ ТОВАРІВ
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let url = `${API_BASE_URL}/api/products?page=${currentPage}&pageSize=${pageSize}`;
        if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (categoryId) url += `&categoryId=${categoryId}`;

        const response = await axios.get<PagedResponse>(url);

        setProducts(response.data.items);
        setTotalPages(response.data.totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити товари.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm, categoryId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return (
      <div className="flex justify-center items-center h-[60vh] pt-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
  );

  if (error) return <div className="text-center py-20 pt-40 text-red-600">{error}</div>;

  // Визначення заголовка
  const currentCategoryName = breadcrumbs.length > 0 
      ? breadcrumbs[breadcrumbs.length - 1].name 
      : "";

  const pageTitle = searchTerm 
      ? (categoryId ? `Пошук у "${currentCategoryName}": "${searchTerm}"` : `Результати пошуку: "${searchTerm}"`)
      : (categoryId ? currentCategoryName : 'Наші товари');

  return (
    // 👇 ЗМІНЕНО pt-16 на pt-40 (для високого Navbar)
    <div className="container mx-auto px-4 py-4 pt-8 min-h-screen flex flex-col">
      
      {/* Хлібні крихти (Показуємо тільки якщо ми в категорії) */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="flex items-center hover:text-blue-600 transition-colors">
                <FaHome className="mr-2" /> Головна
            </Link>
            
            {breadcrumbs.map((cat, index) => (
                <div key={cat.id} className="flex items-center">
                    <FaAngleRight className="mx-2 text-gray-400 flex-shrink-0" />
                    {/* Клік по крихті веде на пошук у цій категорії */}
                    <Link 
                        to={`/?categoryId=${cat.id}${searchTerm ? `&search=${searchTerm}` : ''}`} 
                        className={`hover:text-blue-600 transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-900 pointer-events-none' : ''}`}
                    >
                        {cat.name}
                    </Link>
                </div>
            ))}
        </nav>
      )}

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          {pageTitle}
        </h1>       
      </div>

      <div className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
               <div key={product.id} className="flex justify-center sm:justify-start">
                   <ProductCard product={product} />
               </div>
            ))}
        </div>
        
        {products.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                Товарів не знайдено.
                {searchTerm && (
                    <div className="mt-4">
                        <Link to="/" className="text-blue-600 hover:underline">Скинути пошук</Link>
                    </div>
                )}
            </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-6 pb-8">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center gap-2 px-6 py-3 rounded-full border font-semibold transition-all shadow-sm ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                <FaChevronLeft /> Попередня
            </button>
            <span className="text-gray-600 font-medium">Сторінка <span className="text-gray-900 font-bold">{currentPage}</span> з {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center gap-2 px-6 py-3 rounded-full border font-semibold transition-all shadow-sm ${currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                Наступна <FaChevronRight />
            </button>
        </div>
      )}
    </div>
  );
};

export default Home;