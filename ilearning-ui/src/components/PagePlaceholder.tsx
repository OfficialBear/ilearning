import { Card, Empty, Typography } from 'antd';

interface PagePlaceholderProps {
  title: string;
  description: string;
}

/**
 * 通用页面骨架占位：仅用于标记“路由可达、业务功能待实现”的页面，
 * 不得用于冒充已完成的业务功能。
 */
export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      <Empty description="页面骨架已就绪，业务功能待实现" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </Card>
  );
}
