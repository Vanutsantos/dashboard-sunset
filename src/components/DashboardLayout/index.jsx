import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';

const { Sider, Content } = Layout;

function DashboardLayout() {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const { isDark } = useTheme();
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDark ? 'dark' : 'light'}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <TopBar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
