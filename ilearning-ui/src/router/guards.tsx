import { Result } from 'antd';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import AuthSplash from '@/components/AuthSplash';
import LoginPage from '@/pages/login';
import { retryBootstrap, useAuth } from '@/stores/auth';
import { readFromPath } from '@/utils/navigation';

/**
 * 受保护路由：会话恢复中展示过渡页；未登录跳转 /login 并记录来源，登录成功后回跳。
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthSplash />;
  }
  if (status === 'error') {
    return <AuthSplash error onRetry={retryBootstrap} />;
  }
  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }
  return <Outlet />;
}

/** 登录页入口：恢复中展示过渡页；已登录用户直达目标页，不再停留登录页。 */
export function LoginGate() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthSplash />;
  }
  if (status === 'error') {
    return <AuthSplash error onRetry={retryBootstrap} />;
  }
  if (status === 'authenticated') {
    const from = readFromPath(location.state);
    return <Navigate to={from ?? '/'} replace />;
  }
  return <LoginPage />;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const allowed = roles.some((role) => user?.roles?.includes(role));
  if (!allowed) {
    return <Result status="403" title="403" subTitle="没有访问权限" />;
  }
  return <>{children}</>;
}
