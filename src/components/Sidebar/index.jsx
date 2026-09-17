import { Menu, Modal, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PATHS, teacherSalesPath } from '../../routes/paths';
import logo from '../../assets/logo.jpg';

const logoutItem = {
  key: 'logout',
  icon: <LogoutOutlined />,
  label: 'Sair',
  danger: true,
};

// Menu completo (admin).
const adminMenuItems = [
  {
    key: PATHS.home,
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: PATHS.clients,
    icon: <TeamOutlined />,
    label: 'Clientes',
  },
  {
    key: PATHS.teachers,
    icon: <UserOutlined />,
    label: 'Professores',
  },
  {
    key: PATHS.sales,
    icon: <ShoppingCartOutlined />,
    label: 'Vendas',
  },
  { type: 'divider' },
  logoutItem,
];

function Sidebar({ collapsed, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isTeacher, teacher, roleResolved } = useAuth();
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  // Por padrão o menu não expõe itens de admin. Só mostramos o menu completo
  // depois de confirmar que o papel foi resolvido E o usuário não é professor.
  let menuItems;
  if (roleResolved && isTeacher && teacher) {
    // Professor: apenas a própria página de vendas.
    menuItems = [
      {
        key: teacherSalesPath(teacher.id),
        icon: <ShoppingCartOutlined />,
        label: 'Minhas vendas',
      },
      { type: 'divider' },
      logoutItem,
    ];
  } else if (roleResolved && !isTeacher) {
    // Admin: menu completo.
    menuItems = adminMenuItems;
  } else {
    // Papel ainda não resolvido: só o "Sair" (nada de admin/aluno por engano).
    menuItems = [logoutItem];
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      Modal.confirm({
        title: 'Sair do sistema',
        content: 'Tem certeza que deseja sair?',
        okText: 'Sair',
        cancelText: 'Cancelar',
        okButtonProps: { danger: true },
        onOk: () => logout(),
      });
      return;
    }
    navigate(key);
    // Fecha o drawer no mobile após navegar.
    onNavigate?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '0 12px',
          borderBottom: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ height: 36, aspectRatio: 1, objectFit: 'cover', borderRadius: '50%' }}
        />
        {!collapsed && (
          <h2 style={{ margin: 0, fontSize: 18, whiteSpace: 'nowrap' }}>Dashboard Sunset</h2>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ flex: 1, borderRight: 0 }}
      />
    </div>
  );
}

export default Sidebar;
