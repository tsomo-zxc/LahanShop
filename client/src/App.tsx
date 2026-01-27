import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // <--- Імпорт
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import CartDrawer from './components/CartDrawer'; // <--- Імпорт (створимо далі)

function App() {
  return (
    <CartProvider> 
      <BrowserRouter>
        {/* Кошик буде жити тут, поверх всіх сторінок */}
        <CartDrawer /> 
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App;