import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footbar from './components/Footbar';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import AdminPage from './pages/AdminPage';
import ProductFormPage from './pages/ProductFormPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import CategoryFormPage from './pages/CategoryFormPage';
import { AuthProvider } from './context/AuthContext.tsx'
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage.tsx';
import OrderSuccessPage from './pages/OrderSuccessPage.tsx';
import OrdersPage from './pages/OrderPage.tsx';
import AdminOrdersPage from './pages/AdminOrdersPage.tsx';
import ConfirmEmailPage from './pages/auth/ConfirmEmailPage.tsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import InfoPage from './pages/InfoPage.tsx';

const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/confirm-email" element={<ConfirmEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/info" element={<InfoPage />} />

                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/products/new" element={<ProductFormPage />} />
                  <Route path="/admin/products/edit/:id" element={<ProductFormPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/categories/new" element={<CategoryFormPage />} />
                  <Route path="/admin/categories/edit/:id" element={<CategoryFormPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />

                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                  <Route path="/orders" element={<OrdersPage />} />

                </Route>
              </Routes>
            </main>
            <Footbar />
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
        </AuthProvider>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;