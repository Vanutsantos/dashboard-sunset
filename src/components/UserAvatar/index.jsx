import { Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Text } = Typography;

function UserAvatar({ compact = false }) {
  const { user } = useAuth();
  const label = user?.displayName || user?.email;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <Avatar icon={<UserOutlined />} />
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, minWidth: 0 }}>
          <Text
            strong
            style={{ fontSize: 14, maxWidth: 180 }}
            ellipsis={{ tooltip: label }}
          >
            {label}
          </Text>
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
