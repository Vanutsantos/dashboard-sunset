import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Guarda para rotas públicas exclusivas de visitantes (ex.: /login).
 * Quando já existe usuário autenticado, redireciona para a página inicial
 * (dashboard).
 */
function PublicRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}

export default PublicRoute;
