import { Button, Tooltip, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import UserAvatar from '../UserAvatar';

function TopBar({ collapsed, onToggleCollapse }) {
  const { isDark, toggleTheme } = useTheme();
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
        background: colorBgContainer,
        borderBottom: `1px solid ${colorBorderSecondary}`,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleCollapse}
        style={{ fontSize: 16 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tooltip title={isDark ? 'Tema claro' : 'Tema escuro'}>
          <Button
            type="text"
            icon={isDark ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            style={{ fontSize: 16 }}
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          />
        </Tooltip>
        <UserAvatar />
      </div>
    </div>
  );
}

export default TopBar;
