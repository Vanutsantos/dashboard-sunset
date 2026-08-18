import { Avatar, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const mockUser = {
  name: 'João Silva',
  email: 'joao@academia.com',
  role: 'Admin',
};

function UserAvatar() {
  const navigate = useNavigate();

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
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

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      navigate('/login');
    }
  };

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
          <Text strong style={{ fontSize: 14 }}>{mockUser.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{mockUser.role}</Text>
        </div>
      </div>
    </Dropdown>
  );
}

export default UserAvatar;
