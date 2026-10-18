import { Button, Spin } from 'antd';

interface AuthSplashProps {
  error?: boolean;
  onRetry?: () => void;
}

/** 鉴权状态恢复期间的全屏过渡（避免误跳登录页）。 */
export default function AuthSplash({ error = false, onRetry }: AuthSplashProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ color: 'rgba(0,0,0,0.65)', marginBottom: 8 }}>
              无法连接服务，请稍后重试
            </div>
            {onRetry && (
              <Button type="link" onClick={onRetry}>
                重试
              </Button>
            )}
          </>
        ) : (
          <>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: 'rgba(0,0,0,0.45)' }}>正在恢复会话…</div>
          </>
        )}
      </div>
    </div>
  );
}
