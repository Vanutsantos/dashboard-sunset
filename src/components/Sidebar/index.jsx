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
import { PATHS } from '../../routes/paths';

const menuItems = [
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
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Sair',
    danger: true,
  },
];

function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <h2 style={{ margin: 0, fontSize: collapsed ? 16 : 18, whiteSpace: 'nowrap' }}>
          {collapsed ? 'DS' : 'Dashboard Sunset'}
        </h2>
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
