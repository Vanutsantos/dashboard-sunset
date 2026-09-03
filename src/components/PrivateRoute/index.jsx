import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Guarda de rota para áreas autenticadas.
 * Quando não há usuário, redireciona para /login preservando a rota de origem
 * em location.state.from, para que o usuário volte a ela após autenticar.
 *
 * Pode ser usado de duas formas:
 *  - Como elemento de rota de layout (renderiza <Outlet /> para as filhas).
 *  - Envolvendo children diretamente (compatibilidade retroativa).
 */
function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}

export default PrivateRoute;
