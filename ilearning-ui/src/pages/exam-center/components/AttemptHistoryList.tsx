import {
  Button,
  Empty,
  Flex,
  Grid,
  Pagination,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { TableProps } from 'antd';
import type { AttemptHistoryItem } from '@/types/attempt';
import { formatDateTime, formatScore } from '@/utils/format';
import { attemptOutcome } from '../attemptMeta';

interface AttemptHistoryListProps {
  items: AttemptHistoryItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onResume: (item: AttemptHistoryItem) => void;
  onViewResult: (item: AttemptHistoryItem) => void;
}

function renderActions(
  item: AttemptHistoryItem,
  onResume: (item: AttemptHistoryItem) => void,
  onViewResult: (item: AttemptHistoryItem) => void,
) {
  return item.status === 1 ? (
    <Button type="link" size="small" onClick={() => onResume(item)}>
      继续作答
    </Button>
  ) : (
    <Button type="link" size="small" onClick={() => onViewResult(item)}>
      查看结果
    </Button>
  );
}

export default function AttemptHistoryList({
  items,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onResume,
  onViewResult,
}: AttemptHistoryListProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const isMobile = !screens.sm;

  if (isMobile) {
    if (items.length === 0) {
      return (
        <Empty
          description={loading ? '加载中…' : '暂无考试记录'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '48px 0' }}
        />
      );
    }
    return (
      <Spin spinning={loading}>
        {items.map((item) => {
          const outcome = attemptOutcome(item);
          return (
            <div
              key={item.id}
              style={{
                padding: '14px 4px',
                borderTop: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Flex justify="space-between" align="flex-start" gap={12}>
                <Flex vertical gap={2} style={{ minWidth: 0 }}>
                  <Typography.Text strong ellipsis={{ tooltip: item.examTitle }}>
                    {item.examTitle}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    第 {item.attemptNo} 次 ·{' '}
                    {formatDateTime(item.submittedAt ?? item.startedAt)}
                  </Typography.Text>
                </Flex>
                <Tag color={outcome.color} style={{ marginInlineEnd: 0, flexShrink: 0 }}>
                  {outcome.label}
                </Tag>
              </Flex>
              <Flex justify="space-between" align="center" gap={8} style={{ marginTop: 10 }}>
                <Typography.Text strong>
                  {item.userScore == null
                    ? '—'
                    : `${formatScore(item.userScore)} / ${formatScore(item.totalScore)}`}
                </Typography.Text>
                {renderActions(item, onResume, onViewResult)}
              </Flex>
            </div>
          );
        })}
        <Flex justify="flex-end" style={{ paddingTop: 12 }}>
          <Pagination
            simple
            current={page}
            pageSize={pageSize}
            total={total}
            size="small"
            onChange={onPageChange}
          />
        </Flex>
      </Spin>
    );
  }

  const columns: TableProps<AttemptHistoryItem>['columns'] = [
    {
      title: '考试',
      key: 'exam',
      render: (_, item) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{item.examTitle}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            第 {item.attemptNo} 次
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 130,
      render: (_, item) => {
        const outcome = attemptOutcome(item);
        return <Tag color={outcome.color}>{outcome.label}</Tag>;
      },
    },
    {
      title: '分数',
      key: 'score',
      width: 150,
      render: (_, item) =>
        item.userScore == null ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : (
          <Typography.Text strong>
            {formatScore(item.userScore)} / {formatScore(item.totalScore)}
          </Typography.Text>
        ),
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '交卷时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 170,
      render: (value: string | null) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, item) => (
        <Space size={0}>{renderActions(item, onResume, onViewResult)}</Space>
      ),
    },
  ];

  return (
    <Table<AttemptHistoryItem>
      rowKey="id"
      columns={columns}
      dataSource={items}
      loading={loading}
      scroll={{ x: 900 }}
      locale={{
        emptyText: <Empty description="暂无考试记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
      }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50],
        showTotal: (value) => `共 ${value} 条记录`,
        onChange: onPageChange,
      }}
    />
  );
}
