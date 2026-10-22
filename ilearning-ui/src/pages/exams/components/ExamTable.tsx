import {
  Button,
  Empty,
  Flex,
  Grid,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { TableProps } from 'antd';
import type { ExamListItem } from '@/types/exam';
import { formatDateTime, formatScore } from '@/utils/format';
import { examPhase, formatAttempts, formatDuration } from '../examMeta';

interface ExamTableProps {
  records: ExamListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onPreview: (record: ExamListItem) => void;
  onEdit: (record: ExamListItem) => void;
  onPublish: (record: ExamListItem) => void;
  onClose: (record: ExamListItem) => void;
  onDelete: (record: ExamListItem) => void;
}

function windowLabel(record: ExamListItem): { start: string; end: string } {
  return {
    start: record.startTime ? formatDateTime(record.startTime) : '不限',
    end: record.endTime ? formatDateTime(record.endTime) : '不限',
  };
}

export default function ExamTable({
  records,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPreview,
  onEdit,
  onPublish,
  onClose,
  onDelete,
}: ExamTableProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const isMobile = !screens.sm;

  const renderActions = (record: ExamListItem) => (
    <Space size={0} wrap>
      <Button type="link" size="small" onClick={() => onPreview(record)}>
        详情
      </Button>
      {record.status === 0 ? (
        <>
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="发布该考试？"
            description={
              record.paperStatus !== 1
                ? '关联试卷已不是已发布状态，请先更换试卷。'
                : '发布后考试规则冻结，将按开放时间面向考生生效。'
            }
            okText="发布"
            cancelText="取消"
            disabled={record.paperStatus !== 1}
            onConfirm={() => onPublish(record)}
          >
            <Button type="link" size="small" disabled={record.paperStatus !== 1}>
              发布
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定删除该考试？"
            description="删除后不可恢复"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ) : null}
      {record.status === 1 ? (
        <Popconfirm
          title="关闭该考试？"
          description="关闭后不再接受新的考试，已有记录保留。"
          okText="关闭"
          cancelText="取消"
          onConfirm={() => onClose(record)}
        >
          <Button type="link" size="small">
            关闭
          </Button>
        </Popconfirm>
      ) : null}
    </Space>
  );

  const columns: TableProps<ExamListItem>['columns'] = [
    {
      title: '考试',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (_, record) => (
        <Flex vertical gap={2} style={{ minWidth: 0 }}>
          <Typography.Text strong ellipsis={{ tooltip: record.title }}>
            {record.title}
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12 }}
            ellipsis={{ tooltip: record.description }}
          >
            {record.description || '暂无说明'}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: '试卷',
      key: 'paper',
      width: 180,
      render: (_, record) => (
        <Flex vertical gap={2} style={{ minWidth: 0 }}>
          <Typography.Text ellipsis={{ tooltip: record.paperTitle }}>
            {record.paperTitle}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            总分 {formatScore(record.paperTotalScore)}
            {record.paperStatus !== 1 ? ' · 试卷不可用' : ''}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: '开放时间',
      key: 'window',
      width: 210,
      render: (_, record) => {
        const { start, end } = windowLabel(record);
        return (
          <Flex vertical gap={2}>
            <Typography.Text style={{ fontSize: 13 }}>开始 {start}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              结束 {end}
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: '规则 / 及格线',
      key: 'rules',
      width: 170,
      render: (_, record) => (
        <Flex vertical gap={2}>
          <Typography.Text style={{ fontSize: 13 }}>
            {formatDuration(record.durationMinutes)} · {formatAttempts(record.maxAttempts)}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            及格 {formatScore(record.passingScore)} / {formatScore(record.paperTotalScore)}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const phase = examPhase(record);
        return (
          <Flex vertical gap={4} align="flex-start">
            <Tag color={phase.color} style={{ marginInlineEnd: 0 }}>
              {phase.label}
            </Tag>
            {record.status === 1 ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                已发布
              </Typography.Text>
            ) : null}
          </Flex>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_, record) => renderActions(record),
    },
  ];

  if (isMobile) {
    if (records.length === 0) {
      return (
        <Empty
          description={loading ? '加载中…' : '暂无考试'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '48px 0' }}
        />
      );
    }
    return (
      <Spin spinning={loading}>
        {records.map((record) => {
          const phase = examPhase(record);
          const { start, end } = windowLabel(record);
          return (
            <div
              key={record.id}
              style={{
                padding: '14px 16px',
                borderTop: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Flex justify="space-between" align="flex-start" gap={12}>
                <Flex vertical gap={2} style={{ minWidth: 0 }}>
                  <Typography.Text strong ellipsis={{ tooltip: record.title }}>
                    {record.title}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {record.paperTitle}
                  </Typography.Text>
                </Flex>
                <Tag color={phase.color} style={{ marginInlineEnd: 0, flexShrink: 0 }}>
                  {phase.label}
                </Tag>
              </Flex>
              <Flex vertical gap={2} style={{ marginTop: 10 }}>
                <Typography.Text style={{ fontSize: 13 }}>
                  {start} ~ {end}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDuration(record.durationMinutes)} · {formatAttempts(record.maxAttempts)} ·
                  及格 {formatScore(record.passingScore)} 分
                </Typography.Text>
              </Flex>
              <Flex justify="flex-end" style={{ marginTop: 8 }}>
                {renderActions(record)}
              </Flex>
            </div>
          );
        })}
        <Flex
          justify="flex-end"
          style={{ padding: '12px 16px', borderTop: `1px solid ${token.colorBorderSecondary}` }}
        >
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

  return (
    <Table<ExamListItem>
      rowKey="id"
      columns={columns}
      dataSource={records}
      loading={loading}
      scroll={{ x: 1160 }}
      locale={{
        emptyText: <Empty description="暂无考试" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
      }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (value) => `共 ${value} 场考试`,
        onChange: onPageChange,
      }}
    />
  );
}
