import './Navbar.css'; 
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="navbar-logo">LahanShop 🚀</h2>
        
        <div className="navbar-links">
          <span className="nav-link">Головна</span>
          <span className="nav-link">Каталог</span>
          <span className="nav-link">Про нас</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;