import { Button, Tooltip, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import useIsMobile from '../../hooks/useIsMobile';
import UserAvatar from '../UserAvatar';

function TopBar({ collapsed, onToggleCollapse }) {
  const { isDark, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  // No mobile o ícone é sempre o de "abrir menu" (a sidebar é um drawer).
  const menuIcon = isMobile ? (
    <MenuUnfoldOutlined />
  ) : collapsed ? (
    <MenuUnfoldOutlined />
  ) : (
    <MenuFoldOutlined />
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 24px',
        height: 64,
        background: colorBgContainer,
        borderBottom: `1px solid ${colorBorderSecondary}`,
      }}
    >
      <Button
        type="text"
        icon={menuIcon}
        onClick={onToggleCollapse}
        style={{ fontSize: 16 }}
        aria-label="Alternar menu"
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
        <UserAvatar compact={isMobile} />
      </div>
    </div>
  );
}

export default TopBar;
