import { Button, Empty, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd';
import type { QuestionListItem } from '@/types/question';
import {
  formatDateTime,
  QUESTION_DIFFICULTY_META,
  QUESTION_TYPE_META,
} from '../questionMeta';

interface QuestionTableProps {
  records: QuestionListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onPreview: (record: QuestionListItem) => void;
  onEdit: (record: QuestionListItem) => void;
  onCopy: (record: QuestionListItem) => void;
  onDelete: (record: QuestionListItem) => void;
}

export default function QuestionTable({
  records,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPreview,
  onEdit,
  onCopy,
  onDelete,
}: QuestionTableProps) {
  const columns: TableProps<QuestionListItem>['columns'] = [
    {
      title: '题干',
      dataIndex: 'content',
      key: 'content',
      ellipsis: { showTitle: false },
      render: (content: string) => (
        <Tooltip title={content} placement="topLeft">
          <Typography.Text ellipsis style={{ maxWidth: 360 }}>
            {content}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: '题型',
      dataIndex: 'questionType',
      key: 'questionType',
      width: 90,
      render: (questionType: QuestionListItem['questionType']) => (
        <Tag color={QUESTION_TYPE_META[questionType].color}>
          {QUESTION_TYPE_META[questionType].label}
        </Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 90,
      render: (difficulty: QuestionListItem['difficulty']) => (
        <Tag color={QUESTION_DIFFICULTY_META[difficulty].color}>
          {QUESTION_DIFFICULTY_META[difficulty].label}
        </Tag>
      ),
    },
    {
      title: '所属题库',
      dataIndex: 'questionBank',
      key: 'questionBank',
      width: 220,
      render: (bank: QuestionListItem['questionBank']) =>
        bank ? (
          <Tag>{bank.title}</Tag>
        ) : (
          <Typography.Text type="secondary">未归类</Typography.Text>
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
      width: 230,
      render: (_, record) => (
        <Space size={0} wrap>
          <Button type="link" size="small" onClick={() => onPreview(record)}>
            预览
          </Button>
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => onCopy(record)}>
            复制
          </Button>
          <Popconfirm
            title="确定删除该试题？"
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
        </Space>
      ),
    },
  ];

  return (
    <Table<QuestionListItem>
      rowKey="id"
      columns={columns}
      dataSource={records}
      loading={loading}
      scroll={{ x: 1000 }}
      locale={{ emptyText: <Empty description="暂无试题" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (value) => `共 ${value} 条`,
        onChange: onPageChange,
      }}
    />
  );
}
