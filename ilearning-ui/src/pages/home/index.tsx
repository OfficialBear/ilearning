import { Card, Col, Row, Typography } from 'antd';
import { Link } from 'react-router';

const entries = [
  {
    to: '/questions',
    title: '试题管理',
    description: '试题的录入、编辑与维护（待实现）',
  },
  {
    to: '/question-banks',
    title: '题库管理',
    description: '题库的组织与分类管理（待实现）',
  },
  {
    to: '/exams',
    title: '考试管理',
    description: '考试的创建与安排（待实现）',
  },
];

export default function HomePage() {
  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          欢迎使用 iLearning
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          平台骨架已搭建完成，可通过下方入口进入各管理模块。
        </Typography.Paragraph>
      </Card>
      <Row gutter={[16, 16]}>
        {entries.map((entry) => (
          <Col key={entry.to} xs={24} sm={8}>
            <Link to={entry.to}>
              <Card hoverable title={entry.title}>
                <Typography.Text type="secondary">{entry.description}</Typography.Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
