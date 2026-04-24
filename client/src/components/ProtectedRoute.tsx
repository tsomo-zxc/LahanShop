import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ requireAdmin }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin } = useAuth();

    // 1. Check if user is logged in
    if (!isAuthenticated) {
        // replace means we don't save this attempt in the browser history
        return <Navigate to="/login" replace />;
    }

    // 2. Check if admin rights are required
    if (requireAdmin && !isAdmin) {
        // If the user tried to access the admin panel but is not an admin -> redirect to the main page
        return <Navigate to="/" replace />;
    }

    // 3. If all checks pass -> render child routes
    return <Outlet />;
};

export default ProtectedRoute;