import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Typography, message, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { APP_ROUTES, resolveRoute } from '@/router/routes';
import { logout, useAuth } from '@/stores/auth';
import { ApiError } from '@/utils/request';

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const { pathname } = useLocation();
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [messageApi, messageHolder] = message.useMessage();
  const user = useAuth().user;

  const visibleRoutes = APP_ROUTES.filter(
    (route) => !route.roles || route.roles.some((role) => user?.roles?.includes(role)),
  );
  const menuItems: MenuProps['items'] = visibleRoutes.map((route) => ({
    key: route.path,
    icon: route.icon,
    label: <Link to={route.path}>{route.title}</Link>,
  }));

  const activeRoute = resolveRoute(pathname);
  const displayName = user?.nickname || user?.username || '';
  const initial = displayName !== '' ? displayName.charAt(0) : '?';

  const handleLogout = () => {
    logout().catch((cause: unknown) => {
      if (cause instanceof ApiError) {
        messageApi.error(cause.message);
      }
    });
  };

  const userMenuItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  return (
    <>
      {messageHolder}
      <Layout style={{ minHeight: '100dvh' }}>
        <Sider
          theme="light"
          width={220}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
          style={{
            borderRight: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingInline: 24,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: token.colorPrimaryBg,
                color: token.colorPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              iL
            </div>
            {!collapsed && <span style={{ fontWeight: 600, fontSize: 16 }}>iLearning</span>}
          </div>
          <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={[activeRoute.path]}
            style={{ borderInlineEnd: 'none' }}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingInline: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed((value) => !value)}
              />
              <Typography.Title level={4} style={{ margin: 0 }}>
                {activeRoute.title}
              </Typography.Title>
            </div>
            <Dropdown
              placement="bottomRight"
              trigger={['click']}
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    handleLogout();
                  }
                },
              }}
            >
              <Button
                type="text"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 'auto',
                  padding: '4px 8px',
                }}
              >
                <Avatar
                  size={28}
                  style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary }}
                >
                  {initial}
                </Avatar>
                <span style={{ fontSize: 14 }}>{displayName || <UserOutlined />}</span>
              </Button>
            </Dropdown>
          </Header>
          <Content style={{ padding: '0 24px 24px' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
