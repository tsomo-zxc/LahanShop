import React, { useEffect, useState } from 'react';
import api from '../services/axiosInstance';
import { FaChevronLeft, FaChevronRight, FaHome, FaAngleRight, FaTruck, FaCreditCard, FaHeadset } from 'react-icons/fa';
import { useSearchParams, Link } from 'react-router-dom';
import type { Product } from '../types';
import type { Category } from '../types'; // Переконайтесь, що цей тип є
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

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
        const res = await api.get<Category[]>(`/api/categories`);
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

        let url = `/api/products?page=${currentPage}&pageSize=${pageSize}`;
        if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (categoryId) url += `&categoryId=${categoryId}`;

        const response = await api.get<PagedResponse>(url);

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
    : (categoryId ? currentCategoryName : 'Найновіші товари');

  const isHomeView = !searchTerm && !categoryId && currentPage === 1;

  return (
    <div className="min-h-screen flex flex-col pt-24 ">
      <SEO url="https://lahan-shop.vercel.app/" />
      {isHomeView && (
        <>
          {/* Hero Section */}
          <section
            className="text-white py-24 px-4 shadow-lg relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('src/assets/Hero-banner.jpg')`,
              backgroundColor: '#1f2937'
            }}
          >
            {/* Затемнення поверх картинки, щоб текст добре читався */}
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="container mx-auto text-center relative z-10">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">
                Авторозбірка Стадники:<br /> Оригінальні Б/В Ford
              </h1>
              <br />
              <br />
              <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-2xl mx-auto drop-shadow">
                Найкращі товари за вигідними цінами. Знайдіть оригінальні та якісні запчастини для вашого автомобіля.
              </p>

            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-gray-50 border-b border-gray-200">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-inner">
                    <FaTruck />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Швидка Доставка</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Доставляємо запчастини по всій Україні надійно та в найкоротші терміни.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-inner">
                    <FaCreditCard />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Зручна Оплата</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Безпечна онлайн-оплата або розрахунок готівкою при отриманні товару.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-inner">
                    <FaHeadset />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Підтримка 24/7</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Наші фахівці завжди готові допомогти вам з вибором правильних деталей.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow">

        {/* Хлібні крихти (Показуємо тільки якщо ми в категорії) */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="flex items-center hover:text-blue-600 transition-colors" title="На головну">
              <FaHome className="mr-2" /> Головна
            </Link>

            {breadcrumbs.map((cat, index) => (
              <div key={cat.id} className="flex items-center">
                <FaAngleRight className="mx-2 text-gray-400 flex-shrink-0" />
                {/* Клік по крихті веде на пошук у цій категорії */}
                <Link
                  to={`/?categoryId=${cat.id}${searchTerm ? `&search=${searchTerm}` : ''}`}
                  className={`hover:text-blue-600 transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-900 pointer-events-none' : ''}`}
                  title={cat.name}
                >
                  {cat.name}
                </Link>
              </div>
            ))}
          </nav>
        )}

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {pageTitle}
          </h2>
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
                  <Link to="/" className="text-blue-600 hover:underline" title="Очистити результати пошуку">Скинути пошук</Link>
                </div>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-6 pb-8">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center gap-2 px-6 py-3 rounded-full border font-semibold transition-all shadow-sm ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`} title="Попередня сторінка">
              <FaChevronLeft /> Попередня
            </button>
            <span className="text-gray-600 font-medium">Сторінка <span className="text-gray-900 font-bold">{currentPage}</span> з {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center gap-2 px-6 py-3 rounded-full border font-semibold transition-all shadow-sm ${currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`} title="Наступна сторінка">
              Наступна <FaChevronRight />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;