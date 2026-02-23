import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Ваш кошик порожній</h2>
        <p className="text-gray-500 mb-8">Схоже, ви ще нічого не додали.</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
           Повернутися до покупок
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Кошик</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ЛІВА ЧАСТИНА - Список */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 space-y-6">
                {items.map(item => (
                    <div key={item.productId} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                        {/* Картинка */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                            )}
                        </div>

                        {/* Інфо */}
                        <div className="flex-grow">
                            <h3 className="font-semibold text-lg text-gray-800">
                                <Link to={`/product/${item.productId}`} className="hover:text-blue-600">
                                    {item.name}
                                </Link>
                            </h3>
                            <p className="text-gray-500 text-sm">Ціна: {item.price} грн</p>
                        </div>

                        {/* Кількість */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                            >
                                <FaMinus size={12} />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                                disabled={item.quantity >= item.stockQuantity}
                            >
                                <FaPlus size={12} />
                            </button>
                        </div>

                        {/* Сума за товар */}
                        <div className="text-right min-w-[80px]">
                            <div className="font-bold text-lg">{(item.price * item.quantity).toFixed(0)} грн</div>
                        </div>

                        {/* Видалити */}
                        <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Видалити"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="bg-gray-50 p-4 flex justify-between items-center">
                 <Link to="/" className="text-blue-600 flex items-center gap-2 hover:underline">
                    <FaArrowLeft /> Продовжити покупки
                 </Link>
                 <button onClick={clearCart} className="text-red-600 text-sm hover:underline">
                    Очистити кошик
                 </button>
            </div>
        </div>

        {/* ПРАВА ЧАСТИНА - Підсумок */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-36">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Підсумок замовлення</h2>
                
                <div className="flex justify-between mb-2 text-gray-600">
                    <span>Товарів:</span>
                    <span>{items.reduce((acc, i) => acc + i.quantity, 0)} шт.</span>
                </div>
                
                <div className="flex justify-between text-2xl font-bold mt-4 mb-6">
                    <span>До сплати:</span>
                    <span className="text-blue-600">{totalPrice.toFixed(0)} грн</span>
                </div>

                <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-md transition transform active:scale-[0.98]"
                >
                    Оформити замовлення
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;