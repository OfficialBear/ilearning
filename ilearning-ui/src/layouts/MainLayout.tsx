import { MenuOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { APP_ROUTES, resolveRoute } from '@/router/routes';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = APP_ROUTES.map((route) => ({
  key: route.path,
  icon: route.icon,
  label: <Link to={route.path}>{route.title}</Link>,
}));

export default function MainLayout() {
  const { pathname } = useLocation();
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const activeRoute = resolveRoute(pathname);

  return (
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
        </Header>
        <Content style={{ padding: '0 24px 24px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
