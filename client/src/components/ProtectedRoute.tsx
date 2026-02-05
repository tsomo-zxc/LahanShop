import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ requireAdmin }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin } = useAuth();

    // 1. Перевірка: Чи користувач увійшов?
    if (!isAuthenticated) {
        // replace означає, що ми не зберігаємо цю спробу в історії браузера
        return <Navigate to="/login" replace />;
    }

    // 2. Перевірка: Чи потрібні права Адміна?
    if (requireAdmin && !isAdmin) {
        // Якщо юзер спробував зайти в адмінку, але він не адмін -> кидаємо на головну
        return <Navigate to="/" replace />;
    }

    // 3. Якщо всі перевірки пройдено -> рендеримо дочірні маршрути
    return <Outlet />;
};

export default ProtectedRoute;