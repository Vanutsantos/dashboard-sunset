import { Layout, Drawer, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import useIsMobile from '../../hooks/useIsMobile';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';

const { Sider, Content } = Layout;

function DashboardLayout() {
  // No desktop, "collapsed" recolhe a sidebar (persistido).
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  // No mobile, a sidebar vira um Drawer controlado por "mobileOpen".
  const [mobileOpen, setMobileOpen] = useLocalStorage('sidebar-mobile-open', false);
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  const {
    token: { colorBgContainer, colorBorderSecondary, colorBgElevated },
  } = theme.useToken();

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((c) => !c);
    }
  };

  const sidebarNode = <Sidebar collapsed={!isMobile && collapsed} onNavigate={() => setMobileOpen(false)} />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={240}
          closable={false}
          styles={{ body: { padding: 0, background: isDark ? colorBgElevated : colorBgContainer } }}
        >
          {sidebarNode}
        </Drawer>
      ) : (
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
          {sidebarNode}
        </Sider>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 240,
          transition: 'margin-left 0.2s',
        }}
      >
        <TopBar collapsed={collapsed} onToggleCollapse={handleToggle} />
        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 24,
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
