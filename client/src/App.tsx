import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import AdminPage from './pages/AdminPage';
import ProductFormPage from './pages/ProductFormPage';

const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/products/new" element={<ProductFormPage />} />
              <Route path="/admin/products/edit/:id" element={<ProductFormPage />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-200 mt-20 py-10">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} LahanShop. Всі права захищено.
            </div>
          </footer>
        </div>
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;