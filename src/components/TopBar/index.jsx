import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import UserAvatar from '../UserAvatar';

function TopBar({ collapsed, onToggleCollapse }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleCollapse}
        style={{ fontSize: 16 }}
      />
      <UserAvatar />
    </div>
  );
}

export default TopBar;
