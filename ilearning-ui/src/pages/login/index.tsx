import { CheckCircleFilled, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Grid, Input, Typography, message, theme } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { LoginPayload } from '@/types/api';
import { readFromPath } from '@/utils/navigation';
import { ApiError } from '@/utils/request';
import { login } from '@/stores/auth';

const VALUE_POINTS = [
  '试题灵活分级管理，按需选题组卷',
  '公开、定员、限时多种考试模式',
  '试卷与考试记录完整留存，便于复盘',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, messageHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const showBrandPanel = screens.lg ?? false;

  const handleFinish = async (values: LoginPayload) => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await login({ username: values.username.trim(), password: values.password });
      const from = readFromPath(location.state);
      navigate(from ?? '/', { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError) {
        messageApi.error(cause.message);
        return;
      }
      throw cause;
    } finally {
      setSubmitting(false);
    }
  };

  const brandPanelStyle: CSSProperties = {
    width: '46%',
    background: `linear-gradient(160deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBgHover} 58%, ${token.colorPrimaryBorder} 130%)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 56px',
    position: 'relative',
    overflow: 'hidden',
  };

  const decorRingStyle: CSSProperties = {
    width: 380,
    height: 380,
    borderRadius: '50%',
    border: `1.5px solid ${token.colorPrimaryBorder}`,
    opacity: 0.45,
    position: 'absolute',
    top: -96,
    right: -108,
    pointerEvents: 'none',
  };

  const decorCircleStyle: CSSProperties = {
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: token.colorPrimaryBgHover,
    opacity: 0.4,
    position: 'absolute',
    bottom: -72,
    left: -64,
    pointerEvents: 'none',
  };

  const decorDotsStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(${token.colorPrimaryBorder} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
    opacity: 0.22,
    pointerEvents: 'none',
  };

  const logoMarkStyle: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: token.colorPrimary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
  };

  const formSurfaceStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 24px 40px',
  };

  const formCardStyle: CSSProperties = {
    width: '100%',
    maxWidth: 396,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: '40px 40px 32px',
  };

  const brandRow: ReactNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={logoMarkStyle}>iL</div>
      <span style={{ fontWeight: 700, fontSize: 20 }}>iLearning</span>
    </div>
  );

  const renderLoginForm = () => (
    <div style={formCardStyle}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        {screens.lg ? null : <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{brandRow}</div>}
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          欢迎回来
        </Typography.Title>
        <Typography.Text type="secondary">登录 iLearning，继续你的教学工作</Typography.Text>
      </div>
      <Form<LoginPayload>
        layout="vertical"
        size="large"
        onFinish={handleFinish}
      >
        <Form.Item<LoginPayload>
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { max: 32, message: '用户名最长 32 位' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
            autoComplete="username"
            maxLength={32}
          />
        </Form.Item>
        <Form.Item<LoginPayload>
          label="密码"
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { max: 20, message: '密码最长 20 位' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
            autoComplete="current-password"
            maxLength={20}
          />
        </Form.Item>
        <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
          <Button block type="primary" htmlType="submit" loading={submitting}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        background: token.colorBgLayout,
      }}
    >
      {messageHolder}
      {showBrandPanel && (
        <div style={brandPanelStyle}>
          <div style={decorDotsStyle} />
          <div style={decorRingStyle} />
          <div style={decorCircleStyle} />
          <div style={{ position: 'relative', marginTop: '8vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <div style={{ ...logoMarkStyle, boxShadow: token.boxShadowSecondary }}>
                iL
              </div>
              <span style={{ fontWeight: 700, fontSize: 24, color: token.colorPrimaryTextActive }}>
                iLearning
              </span>
            </div>
            <Typography.Title
              level={2}
              style={{ color: token.colorPrimaryTextActive, marginBottom: 12, maxWidth: 420 }}
            >
              教学、题库与考试，一站式管理
            </Typography.Title>
            <Typography.Paragraph
              style={{
                color: token.colorPrimaryTextActive,
                opacity: 0.85,
                maxWidth: 420,
                fontSize: 15,
              }}
            >
              为教学与培训提供覆盖命题、组卷到判分评析的全流程支撑
            </Typography.Paragraph>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 32 }}>
              {VALUE_POINTS.map((point) => (
                <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircleFilled style={{ color: token.colorPrimary, fontSize: 16 }} />
                  <span style={{ color: token.colorTextSecondary, fontSize: 15 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              color: token.colorPrimaryTextActive,
              opacity: 0.7,
              fontSize: 13,
            }}
          >
            iLearning · 学习考试一体化平台
          </div>
        </div>
      )}
      <div style={formSurfaceStyle}>{renderLoginForm()}</div>
    </div>
  );
}
