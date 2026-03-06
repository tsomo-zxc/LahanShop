import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Product, ProductImage, Category } from '../types';
import api, { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { CURRENCY_FORMATTER, API_BASE_URL } from '../constants';
import { FaShoppingCart, FaHome, FaAngleRight, FaBuilding } from 'react-icons/fa';
import SEO from '../components/SEO';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]);

  useEffect(() => {
    const buildBreadcrumbs = async () => {
      if (!product || !product.categoryName) return;
      try {
        const res = await api.get<Category[]>('/api/categories');
        const allCategories = res.data;

        const productCategory = allCategories.find((c: Category) => c.name === product.categoryName);
        if (!productCategory) return;

        const path: Category[] = [];
        let currentId: number | null = productCategory.id;

        while (currentId !== null) {
          const category = allCategories.find((c: Category) => c.id === currentId);
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
  }, [product]);

  useEffect(() => {
    if (!id) return;


    const fetchProduct = async () => {
      try {
        const data = await productService.getById(Number(id));
        if (data) {
          setProduct(data);
          // Set initial image
          if (data.images && data.images.length > 0) {
            const firstImg = data.images[0].url;
            setSelectedImage(firstImg.startsWith('http') ? firstImg : `${API_BASE_URL}${firstImg.startsWith('/') ? '' : '/'}${firstImg}`);
          } else {
            setSelectedImage("https://picsum.photos/800/800?grayscale");
          }
        } else {
          // Handle not found
          navigate('/');
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Parse specifications safely
  const specifications = useMemo(() => {
    if (!product || !product.specifications) return {};
    try {
      return JSON.parse(product.specifications);
    } catch (e) {
      console.error("Error parsing specifications JSON", e);
      return {};
    }
  }, [product]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const cleanDesc = product.description
    ? product.description.substring(0, 60).trim() + "... "
    : "";

  // 2. Формуємо потужний гібридний SEO-опис (до 150-160 символів)
  const seoDescription = `Оригінал Б/В ${product.name}. ${cleanDesc} Доставка по Україні | Авторозбірка Стадники.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": selectedImage,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "UAH",
      "price": product.price,
      "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="container mx-auto px-4 pb-12 pt-32 max-w-7xl">
      <SEO
        title={`${product.name} Б/В | Авторозбірка Стадники`}
        description={seoDescription}
        keywords={`купити ${product.name}, ${product.categoryName}, б/в запчастини, авторозбірка`}
        image={selectedImage}
        type="product"
        url={window.location.href}
        jsonLd={jsonLd}
      />

      {/* Хлібні крихти */}
      <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <Link title="Головна сторінка" to="/" className="flex items-center hover:text-blue-600 transition-colors">
          <FaHome className="mr-2" /> Головна
        </Link>
        {breadcrumbs.map((cat) => (
          <div key={cat.id} className="flex items-center">
            <FaAngleRight className="mx-2 text-gray-400 flex-shrink-0" />
            <Link
              title={cat.name}
              to={`/category/${cat.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {cat.name}
            </Link>
          </div>
        ))}
        {product && (
          <div className="flex items-center">
            <FaAngleRight className="mx-2 text-gray-400 flex-shrink-0" />
            <span className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[400px]">
              {product.name}
            </span>
          </div>
        )}
      </nav>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left Side: Gallery */}
          <div className="p-6 md:p-8 lg:p-12 bg-gray-50 flex flex-col items-center justify-start h-full">
            <div className="w-full aspect-square max-w-lg mb-6 rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100">
              <img
                src={selectedImage}
                alt={product.name}
                title={product.name}
                className="w-full h-full object-contain object-center hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2 w-full max-w-lg">
                {product.images.map((img: ProductImage) => {
                  const fullUrl = img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url.startsWith('/') ? '' : '/'}${img.url}`;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(fullUrl)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === fullUrl ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                      <img src={fullUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Info */}
          <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2">
              {product.categoryName}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-gray-900 mb-6">
              {CURRENCY_FORMATTER.format(product.price)}
            </p>

            <div className="prose prose-slate text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </div>

            {/* Delivery Options Block */}
            <div className="bg-gray-50 border border-gray-200 shadow-md rounded-xl p-5 mb-8">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                <FaBuilding className="text-blue-500" /> Варіанти доставки
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'nova', name: 'Нова Пошта', logo: '/Nova_Poshta_logo.svg', title: 'Нова Пошта' },
                  { id: 'ukr', name: 'Укрпошта', logo: '/site-ua-logo.svg', title: 'Укрпошта' },
                  { id: 'meest', name: 'Meest', logo: '/Meest_Corporation_logo.svg', title: 'Meest' },
                  { id: 'delivery', name: 'Delivery', logo: '/delGroup_logo.svg', hasBg: true, title: 'Delivery' },
                ].map((c) => (
                  <div key={c.id} className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={c.logo}
                      alt={c.name}
                      title={c.title}
                      className={`h-6 w-auto object-contain ${c.hasBg ? 'bg-[#009A44] px-1.5 py-0.5 rounded' : ''}`}
                    />
                    <span className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-wide">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500 flex items-start gap-2 bg-blue-50/50 p-2.5 rounded border border-blue-100/50">
                <span className="text-blue-500 mt-0.5">ℹ️</span>
                <span>Доставка здійснюється за тарифами перевізника по всій Україні. Відправка кожного дня.</span>
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => addToCart(product)}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transform active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FaShoppingCart size={20} />
                <span>Додати в кошик</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Specifications */}
        {Object.keys(specifications).length > 0 && (
          <div className="border-t-4 border-gray-100 border-dashed p-6 md:p-8 lg:p-12 bg-white mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Технічні характеристики</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(specifications).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 w-1/3 bg-gray-50/70 border-r border-gray-200">
                        {key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;