import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

/**
 * Layout raiz da árvore de rotas.
 * Mantém os providers que precisam viver dentro do contexto do router
 * (para poderem usar hooks como useNavigate/useLocation) acima de todas
 * as rotas, autenticadas ou públicas.
 */
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default RootLayout;
