import { isAuthenticated, isAdmin } from '../utils/authUtils';
import { useLocation } from 'preact-iso';

const AdminProtectedRoute = ({ component: Component, path }) => {
  const { url } = useLocation();

  if (!isAuthenticated() && url !== '/auth/login') {
    window.location.href = '/auth/login'; // Redirect to login if not authenticated
    return null;
  }

  if (!isAdmin()) {
    window.location.href = '/dashboard';
    return null;
  }

  return <Component />;
};

export default AdminProtectedRoute;
