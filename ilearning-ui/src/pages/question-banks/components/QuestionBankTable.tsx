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
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { TableProps } from 'antd';
import type { QuestionBankListItem } from '@/types/question';
import { formatDateTime } from '@/utils/format';
import { BANK_STATUS_META, QUESTION_TYPE_LABEL } from '../questionBankMeta';

interface QuestionBankTableProps {
  records: QuestionBankListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  statusUpdatingId: number | null;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (record: QuestionBankListItem) => void;
  onToggleStatus: (record: QuestionBankListItem) => void;
  onDelete: (record: QuestionBankListItem) => void;
  onViewQuestions: (record: QuestionBankListItem) => void;
}

export default function QuestionBankTable({
  records,
  loading,
  page,
  pageSize,
  total,
  statusUpdatingId,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewQuestions,
}: QuestionBankTableProps) {
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const isMobile = !screens.sm;

  const renderActions = (record: QuestionBankListItem) => {
    const nextStatus = record.status === 1 ? 0 : 1;
    const hasQuestions = (record.totalQuestions ?? 0) > 0;
    return (
      <Space size={0} wrap>
        <Button type="link" size="small" onClick={() => onViewQuestions(record)}>
          试题
        </Button>
        <Button type="link" size="small" onClick={() => onEdit(record)}>
          编辑
        </Button>
        <Popconfirm
          title={nextStatus === 1 ? '启用该题库？' : '停用该题库？'}
          description={
            nextStatus === 1
              ? '启用后可继续在该题库下新增试题。'
              : '停用后无法在该题库下新增试题，已有试题不受影响。'
          }
          okText="确定"
          cancelText="取消"
          onConfirm={() => onToggleStatus(record)}
        >
          <Button type="link" size="small" loading={statusUpdatingId === record.id}>
            {nextStatus === 1 ? '启用' : '停用'}
          </Button>
        </Popconfirm>
        {hasQuestions ? (
          <Tooltip title={`题库下仍有 ${record.totalQuestions} 道试题，无法删除`}>
            <span>
              <Button type="link" size="small" danger disabled>
                删除
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Popconfirm
            title="确定删除该题库？"
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
        )}
      </Space>
    );
  };

  const columns: TableProps<QuestionBankListItem>['columns'] = [
    {
      title: '题库',
      dataIndex: 'title',
      key: 'title',
      width: 300,
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
      title: '题目分布',
      key: 'questions',
      width: 260,
      render: (_, record) => {
        const totalQuestions = record.totalQuestions ?? 0;
        const enabledQuestions = record.enabledQuestions ?? 0;
        const typeSummary = (record.questionTypeCounts ?? [])
          .map((item) => `${QUESTION_TYPE_LABEL[item.questionType]} ${item.total}`)
          .join(' · ');
        return (
          <Flex vertical gap={2}>
            <Typography.Text strong>{totalQuestions} 题</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {totalQuestions === 0 ? '暂无试题' : typeSummary}
              {totalQuestions > 0 && enabledQuestions < totalQuestions
                ? ` · 启用 ${enabledQuestions}`
                : ''}
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: QuestionBankListItem['status']) => (
        <Tag color={BANK_STATUS_META[status].color}>{BANK_STATUS_META[status].label}</Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
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
          description={loading ? '加载中…' : '暂无题库'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '48px 0' }}
        />
      );
    }
    return (
      <Spin spinning={loading}>
        {records.map((record) => {
          const totalQuestions = record.totalQuestions ?? 0;
          const typeSummary = (record.questionTypeCounts ?? [])
            .map((item) => `${QUESTION_TYPE_LABEL[item.questionType]} ${item.total}`)
            .join(' · ');
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
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 12 }}
                    ellipsis={{ tooltip: record.description }}
                  >
                    {record.description || '暂无描述'}
                  </Typography.Text>
                </Flex>
                <Tag
                  color={BANK_STATUS_META[record.status].color}
                  style={{ marginInlineEnd: 0, flexShrink: 0 }}
                >
                  {BANK_STATUS_META[record.status].label}
                </Tag>
              </Flex>
              <Flex justify="space-between" align="flex-end" gap={8} wrap style={{ marginTop: 10 }}>
                <Flex vertical gap={2}>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    {totalQuestions} 题
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {totalQuestions === 0 ? '暂无试题' : typeSummary}
                  </Typography.Text>
                </Flex>
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
    <Table<QuestionBankListItem>
      rowKey="id"
      columns={columns}
      dataSource={records}
      loading={loading}
      scroll={{ x: 1000 }}
      locale={{
        emptyText: <Empty description="暂无题库" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
      }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (value) => `共 ${value} 个题库`,
        onChange: onPageChange,
      }}
    />
  );
}
