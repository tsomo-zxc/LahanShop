import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { cart, toggleCart } = useCart();
  
  // Рахуємо загальну кількість товарів (штук)
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{textDecoration: 'none', color: 'white'}}>
           NovaShop 🚀
        </Link>
        
        <div className="navbar-links">
          {/* Кнопка Кошика */}
          <div className="nav-cart-btn" onClick={() => toggleCart(true)}>
            🛒 Кошик
            {itemsCount > 0 && <span className="cart-badge">{itemsCount}</span>}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;