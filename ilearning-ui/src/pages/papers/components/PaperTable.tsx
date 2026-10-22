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
import type { PaperListItem } from '@/types/paper';
import { formatDateTime } from '@/utils/format';
import { formatScore, PAPER_STATUS_META } from '../paperMeta';

interface PaperTableProps {
  records: PaperListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onPreview: (record: PaperListItem) => void;
  onEdit: (record: PaperListItem) => void;
  onPublish: (record: PaperListItem) => void;
  onArchive: (record: PaperListItem) => void;
  onDelete: (record: PaperListItem) => void;
}

export default function PaperTable({
  records,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPreview,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
}: PaperTableProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const isMobile = !screens.sm;

  const renderActions = (record: PaperListItem) => (
    <Space size={0} wrap>
      <Button type="link" size="small" onClick={() => onPreview(record)}>
        预览
      </Button>
      {record.status === 0 ? (
        <>
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="发布该试卷？"
            description={
              record.questionCount === 0
                ? '试卷至少需要一道题目才能发布。'
                : '发布后题目、题序和分值将冻结，并生成题目快照。'
            }
            okText="发布"
            cancelText="取消"
            disabled={record.questionCount === 0}
            onConfirm={() => onPublish(record)}
          >
            <Button type="link" size="small" disabled={record.questionCount === 0}>
              发布
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定删除该试卷？"
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
          title="归档该试卷？"
          description="归档后不再用于新的考试活动，历史数据保留。"
          okText="归档"
          cancelText="取消"
          onConfirm={() => onArchive(record)}
        >
          <Button type="link" size="small">
            归档
          </Button>
        </Popconfirm>
      ) : null}
    </Space>
  );

  const columns: TableProps<PaperListItem>['columns'] = [
    {
      title: '试卷',
      dataIndex: 'title',
      key: 'title',
      width: 340,
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
            {record.description || '暂无描述'}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: '题目 / 总分',
      key: 'score',
      width: 160,
      render: (_, record) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{record.questionCount} 题</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            总分 {formatScore(record.totalScore)}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PaperListItem['status']) => (
        <Tag color={PAPER_STATUS_META[status].color}>{PAPER_STATUS_META[status].label}</Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      render: (_, record) => renderActions(record),
    },
  ];

  if (isMobile) {
    if (records.length === 0) {
      return (
        <Empty
          description={loading ? '加载中…' : '暂无试卷'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '48px 0' }}
        />
      );
    }
    return (
      <Spin spinning={loading}>
        {records.map((record) => (
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
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12 }}
                  ellipsis={{ tooltip: record.description }}
                >
                  {record.description || '暂无描述'}
                </Typography.Text>
              </Flex>
              <Tag
                color={PAPER_STATUS_META[record.status].color}
                style={{ marginInlineEnd: 0, flexShrink: 0 }}
              >
                {PAPER_STATUS_META[record.status].label}
              </Tag>
            </Flex>
            <Flex justify="space-between" align="flex-end" gap={8} wrap style={{ marginTop: 10 }}>
              <Flex vertical gap={2}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  {record.questionCount} 题 · {formatScore(record.totalScore)} 分
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  更新于 {formatDateTime(record.updatedAt)}
                </Typography.Text>
              </Flex>
              {renderActions(record)}
            </Flex>
          </div>
        ))}
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
    <Table<PaperListItem>
      rowKey="id"
      columns={columns}
      dataSource={records}
      loading={loading}
      scroll={{ x: 1000 }}
      locale={{
        emptyText: <Empty description="暂无试卷" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
      }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (value) => `共 ${value} 份试卷`,
        onChange: onPageChange,
      }}
    />
  );
}
