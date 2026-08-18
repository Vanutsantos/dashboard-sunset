import { Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/clients',
    icon: <TeamOutlined />,
    label: 'Clientes',
  },
  {
    key: '/teachers',
    icon: <UserOutlined />,
    label: 'Professores',
  },
  {
    key: '/sales',
    icon: <ShoppingCartOutlined />,
    label: 'Vendas',
  },
];

function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
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
          borderBottom: '1px solid rgba(0,0,0,0.06)',
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
