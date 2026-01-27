import  { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../types';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, isOpen, toggleCart, removeFromCart, totalAmount } = useCart();

  if (!isOpen) return null; // Якщо закрито - не малюємо нічого

  return (
    <>
      {/* Затемнення фону */}
      <div className="drawer-overlay" onClick={() => toggleCart(false)} />
      
      {/* Сама панель */}
      <div className="drawer-panel">
        <div className="drawer-header">
          <h2>Ваш кошик 🛒</h2>
          <button className="btn-close-drawer" onClick={() => toggleCart(false)}>✕</button>
        </div>

        {cart.length === 0 ? (
           <div className="drawer-empty">Пусто...</div>
        ) : (
          <div className="drawer-items">
            {cart.map(item => (
              <div key={item.id} className="drawer-item">
                <img 
                  src={item.images?.[0] ? `${API_BASE_URL}${item.images[0].url}` : 'placeholder.jpg'} 
                  alt={item.name} 
                  className="drawer-img"
                />
                <div className="drawer-item-info">
                   <h4>{item.name}</h4>
                   <p>{item.quantity} x {item.price} ₴</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="btn-remove-sm">✕</button>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
            <div className="drawer-footer">
                <div className="total">Всього: {totalAmount} ₴</div>
                <button className="btn-checkout">Оформити</button>
            </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;