import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { teacherSalesPath } from '../../routes/paths';

/**
 * Guarda de acesso por papel.
 * - Admin (usuário sem professor vinculado): acesso liberado a todas as rotas.
 * - Professor (usuário vinculado a um professor pelo e-mail): só pode acessar
 *   a própria página de vendas (/teacher-sales/{seuId}). Qualquer outra rota
 *   redireciona para lá.
 */
function TeacherRoute() {
  const { teacher, isTeacher } = useAuth();
  const location = useLocation();

  if (!isTeacher) {
    // Admin: sem restrições.
    return <Outlet />;
  }

  const allowedPath = teacherSalesPath(teacher.id);
  if (location.pathname !== allowedPath) {
    return <Navigate to={allowedPath} replace />;
  }

  return <Outlet />;
}

export default TeacherRoute;
