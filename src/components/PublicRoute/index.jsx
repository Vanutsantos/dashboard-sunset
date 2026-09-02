import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Guarda para rotas públicas exclusivas de visitantes (ex.: /login).
 * Quando já existe usuário autenticado, redireciona de volta para a rota
 * de origem (se houver) ou para a home.
 */
function PublicRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children ?? <Outlet />;
}

export default PublicRoute;
