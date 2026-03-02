import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product, ProductImage } from '../types';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { CURRENCY_FORMATTER, API_BASE_URL } from '../constants';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

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
            setSelectedImage(firstImg.startsWith('http') ? firstImg : `${API_BASE_URL}${firstImg}`);
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Товар не знайдено</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors">
          <FaArrowLeft className="mr-2" /> Повернутися на головну
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 md:pt-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 md:mb-8 transition-colors bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-full"
      >
        <FaArrowLeft className="mr-2 text-xs" /> Назад до магазину
      </button>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow-xl border border-gray-100 overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left Side: Gallery */}
          <div className="p-6 md:p-8 lg:p-12 bg-white flex flex-col items-center lg:border-r border-gray-100">
            <div className="w-full aspect-square max-w-md lg:max-w-lg mb-6 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center p-4 shadow-inner relative group">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>

            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 w-full max-w-md lg:max-w-lg snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {product.images.map((img: ProductImage) => {
                  const fullUrl = img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(fullUrl)}
                      className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all outline-none snap-center ${selectedImage === fullUrl
                        ? 'border-blue-600 shadow-md ring-2 ring-blue-100 scale-100'
                        : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100 scale-95 hover:scale-100'
                        }`}
                    >
                      <img src={fullUrl} alt="Thumbnail" className="w-full h-full object-cover mix-blend-multiply bg-gray-50" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Info */}
          <div className="p-6 md:p-8 lg:p-12 flex flex-col h-full bg-slate-50/50">
            <div className="mb-3">
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-bold uppercase tracking-widest text-xs rounded-full shadow-sm">
                {product.categoryName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-6 drop-shadow-sm">
              {CURRENCY_FORMATTER.format(product.price)}
            </p>

            <div className="prose prose-sm sm:prose-base prose-slate text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-200/60">
              <button
                onClick={() => addToCart(product)}
                className="w-full lg:w-auto px-8 py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-3 text-lg"
              >
                <FaShoppingCart size={22} />
                <span>Додати в кошик</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Specifications */}
        {specifications && Object.keys(specifications).length > 0 && (
          <div className="border-t border-gray-100">
            <div className="p-6 md:p-8 lg:p-12 bg-white">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center">
                <span className="bg-blue-600 w-2 h-6 md:h-8 rounded-full mr-3 shadow-sm shadow-blue-400/50"></span>
                Технічні характеристики
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-4xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(specifications).map(([key, value], index) => (
                      <tr key={key} className={`transition-colors hover:bg-blue-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm sm:text-base font-semibold text-gray-600 w-1/3 sm:w-1/4 border-r border-gray-100 align-top">
                          {key}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm sm:text-base text-gray-900 break-words align-top">
                          {String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;