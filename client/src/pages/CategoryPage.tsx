import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../services/axiosInstance';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { FaChevronLeft, FaChevronRight, FaHome, FaAngleRight } from 'react-icons/fa';
import type { Category } from '../types';
import SEO from '../components/SEO';

interface PagedResponse {
  items: Product[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallbackCategoryName, setFallbackCategoryName] = useState<string>(""); // Запасна назва

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    setCurrentPage(1);
  }, [id, searchTerm]);

  // 👇 ОСЬ НОВИЙ КОД ДЛЯ ХЛІБНИХ КРИХТ
  useEffect(() => {
    const buildBreadcrumbs = async () => {
      if (!id) return;
      try {
        // Завантажуємо всі категорії
        const res = await api.get<Category[]>(`/api/categories`);
        const allCategories = res.data;

        const path: Category[] = [];
        let currentId: number | null = parseInt(id);

        // Будуємо ланцюжок від низу до верху
        while (currentId !== null) {
          const category = allCategories.find(c => c.id === currentId);
          if (!category) break;
          path.unshift(category);
          currentId = category.parentId; // Йдемо до батька
        }
        setBreadcrumbs(path);
      } catch (error) {
        console.error("Breadcrumbs error", error);
      }
    };
    buildBreadcrumbs();
  }, [id]);
  // 👆 КІНЕЦЬ НОВОГО КОДУ

  // Завантаження товарів
  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;
      try {
        setLoading(true);
        let url = `/api/products?categoryId=${id}&page=${currentPage}&pageSize=${pageSize}`;

        if (searchTerm) {
          url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        }

        const response = await api.get<PagedResponse>(url);

        setProducts(response.data.items);
        setTotalPages(response.data.totalPages);

        // Зберігаємо назву категорії з першого товару на випадок, якщо breadcrumbs ще не прогрузились
        if (response.data.items.length > 0) {
          setFallbackCategoryName(response.data.items[0].categoryName || "");
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Помилка:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id, currentPage, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Визначення заголовка
  const currentCategoryName = breadcrumbs.length > 0
    ? breadcrumbs[breadcrumbs.length - 1].name
    : fallbackCategoryName;

  const pageTitle = searchTerm
    ? `Пошук у "${currentCategoryName}": ${searchTerm}`
    : currentCategoryName || "Категорія";

  const seoDescription = currentCategoryName
    ? `Великий вибір запчастин в категорії ${currentCategoryName}. Авторозбірка Стадники пропонує Б/В запчастини відмінної якості з доставкою по всій Україні.`
    : `Каталог автозапчастин Авторозбірка Стадники.`;

  return (
    <div className="container mx-auto px-4 py-16 pt-24 min-h-screen flex flex-col">
      <SEO
        title={pageTitle}
        description={seoDescription}
        keywords={`запчастини ${currentCategoryName}, б/в автозапчастини, авторозбірка стадники, купити запчастини`}
        url={window.location.href}
        type="website"
      />

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
        {products.length > 0 && <p className="text-gray-500">Сторінка {currentPage} з {totalPages}</p>}
      </div>

      {/* Хлібні крихти */}
      <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="flex items-center hover:text-blue-600 transition-colors" title="На головну">
          <FaHome className="mr-2" /> Головна
        </Link>

        {breadcrumbs.map((cat, index) => (
          <div key={cat.id} className="flex items-center">
            <FaAngleRight className="mx-2 text-gray-400 flex-shrink-0" />
            <Link
              to={`/category/${cat.id}`}
              className={`hover:text-blue-600 transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-900 pointer-events-none' : ''}`}
              title={cat.name}
            >
              {cat.name}
            </Link>
          </div>
        ))}
      </nav>

      <div className="flex-grow">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-500">
              {searchTerm ? `За запитом "${searchTerm}" нічого не знайдено.` : "Товарів поки немає."}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4 pb-8">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600'}`} title="Попередня сторінка">
            <FaChevronLeft size={14} /> Попередня
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map((page) => (
              <button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`} title={`Сторінка ${page}`}>
                {page}
              </button>
            ))}
          </div>

          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600'}`} title="Наступна сторінка">
            Наступна <FaChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;