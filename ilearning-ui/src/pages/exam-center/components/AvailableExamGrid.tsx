import { Button, Card, Col, Descriptions, Empty, Flex, Row, Spin, Tag, Typography } from 'antd';
import type { UserExamItem } from '@/types/attempt';
import { formatDateTime, formatScore } from '@/utils/format';
import {
  formatAttemptLimit,
  formatDurationMinutes,
  formatMaxAttempts,
} from '../attemptMeta';

interface AvailableExamGridProps {
  items: UserExamItem[];
  loading: boolean;
  startingId: number | null;
  onStart: (exam: UserExamItem) => void;
}

export default function AvailableExamGrid({
  items,
  loading,
  startingId,
  onStart,
}: AvailableExamGridProps) {
  if (!loading && items.length === 0) {
    return (
      <Empty
        description="暂无可参加的考试"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '48px 0' }}
      />
    );
  }

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        {items.map((exam) => {
          const inProgress = exam.inProgressAttemptId != null;
          const actionLabel = inProgress
            ? '继续考试'
            : exam.exhausted
              ? '已用完次数'
              : '开始考试';
          return (
            <Col key={exam.id} xs={24} md={12} xl={8} style={{ display: 'flex' }}>
              <Card
                style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                styles={{
                  body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 20 },
                }}
              >
                <Flex vertical gap={12} style={{ flex: 1 }}>
                  <Flex justify="space-between" align="flex-start" gap={12}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {exam.title}
                    </Typography.Title>
                    <Tag
                      color={inProgress ? 'blue' : exam.exhausted ? 'default' : 'green'}
                      style={{ marginInlineEnd: 0, flexShrink: 0 }}
                    >
                      {inProgress ? '进行中' : exam.exhausted ? '已用完次数' : '可参加'}
                    </Tag>
                  </Flex>

                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2, tooltip: exam.description }}
                    style={{ marginBottom: 0, minHeight: 44 }}
                  >
                    {exam.description || '暂无考试说明'}
                  </Typography.Paragraph>

                  <Descriptions
                    size="small"
                    column={1}
                    colon={false}
                    items={[
                      { key: 'paper', label: '试卷', children: exam.paperTitle },
                      {
                        key: 'window',
                        label: '开放时间',
                        children: `${exam.startTime ? formatDateTime(exam.startTime) : '不限'} ~ ${
                          exam.endTime ? formatDateTime(exam.endTime) : '不限'
                        }`,
                      },
                      {
                        key: 'rule',
                        label: '规则',
                        children: `${formatDurationMinutes(exam.durationMinutes)} · ${formatMaxAttempts(exam.maxAttempts)}`,
                      },
                      {
                        key: 'score',
                        label: '及格线',
                        children: `${formatScore(exam.passingScore)} / ${formatScore(exam.totalScore)} 分`,
                      },
                    ]}
                  />

                  <Flex
                    justify="space-between"
                    align="center"
                    gap={12}
                    style={{ marginTop: 'auto', paddingTop: 4 }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      已参加 {formatAttemptLimit(exam.attemptsUsed, exam.maxAttempts)}
                    </Typography.Text>
                    <Button
                      type="primary"
                      disabled={!exam.canStart}
                      loading={startingId === exam.id}
                      onClick={() => onStart(exam)}
                    >
                      {exam.canStart ? actionLabel : '不可参加'}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Spin>
  );
}
