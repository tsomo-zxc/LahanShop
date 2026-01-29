import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { CURRENCY_FORMATTER, API_BASE_URL } from '../constants';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // Handle image logic
  const hasImages = product.images && product.images.length > 0;
  
  // Construct image URL. Assuming API returns relative paths, or absolute. 
  // If it's a full URL (http...), use it. Otherwise prepend base URL.
  let imageUrl = "https://picsum.photos/400/400?grayscale"; // Default placeholder
  
  if (hasImages) {
    const rawUrl = product.images[0].url;
    if (rawUrl.startsWith('http')) {
      imageUrl = rawUrl;
    } else {
      imageUrl = `${API_BASE_URL}${rawUrl}`;
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to details
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full w-full border border-gray-100">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square bg-gray-100">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.categoryName}
        </div>
        <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
            </h3>
        </Link>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-xl font-bold text-gray-900">
            {CURRENCY_FORMATTER.format(product.price)}
          </span>
          
          <button 
            onClick={handleAddToCart}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-all duration-300"
            title="Додати в кошик"
          > 
            <span><FaShoppingCart size={16}  /></span>            
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;