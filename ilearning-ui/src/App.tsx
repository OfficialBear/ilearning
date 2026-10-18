import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router/dom';
import { router } from '@/router';
import { bootstrapAuth } from '@/stores/auth';

// 应用启动即恢复会话（读取 /auth/profile 判定登录态）
bootstrapAuth();

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
