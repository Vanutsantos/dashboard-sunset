import { Avatar, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Text } = Typography;

function UserAvatar() {
  const { user, logout } = useAuth();

  const items = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    }
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }}
      placement="bottomRight"
      trigger={['click']}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
          <Text strong style={{ fontSize: 14 }}>
            {user?.displayName || user?.email}
          </Text>
        </div>
      </div>
    </Dropdown>
  );
}

export default UserAvatar;
