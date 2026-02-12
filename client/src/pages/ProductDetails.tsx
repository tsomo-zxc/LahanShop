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
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
  }

  if (!product) return null;

  return (
    <div className="pb-12 pt-16">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" /> Назад до магазину
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Side: Gallery */}
          <div className="p-6 md:p-8 lg:p-12 bg-gray-50 flex flex-col items-center justify-center">
             <div className="w-full aspect-square max-w-lg mb-6 rounded-2xl overflow-hidden bg-white shadow-sm">
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain object-center hover:scale-105 transition-transform duration-500"
                />
             </div>
             
             {/* Thumbnail Strip */}
             {product.images.length > 1 && (
               <div className="flex space-x-4 overflow-x-auto pb-2 w-full max-w-lg">
                 {product.images.map((img: ProductImage) => {
                   const fullUrl = img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`;
                   return (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(fullUrl)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === fullUrl ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-300'
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
          <div className="border-t border-gray-100 p-6 md:p-8 lg:p-12 bg-gray-50/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Технічні характеристики</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-2xl">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(specifications).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 w-1/3 bg-gray-50/50">
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