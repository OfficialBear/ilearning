import { Button, Drawer, Empty, Flex, Form, Grid, Input, Select, Space, Table, Tag, Typography, message, theme } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { QUESTION_DIFFICULTY_META, QUESTION_DIFFICULTY_OPTIONS, QUESTION_TYPE_META, QUESTION_TYPE_OPTIONS } from '@/pages/questions/questionMeta';
import { fetchQuestions } from '@/services/questions';
import { fetchAvailableBanks } from '@/services/questionBanks';
import type { BankBrief, QuestionListItem } from '@/types/question';
import { ApiError } from '@/utils/request';

interface QuestionPickerFilters {
  keyword?: string;
  questionType?: QuestionListItem['questionType'];
  difficulty?: QuestionListItem['difficulty'];
  questionBankId?: number;
}

interface QuestionPickerContentProps {
  lockedIds: Set<number>;
  onClose: () => void;
  onConfirm: (questions: QuestionListItem[]) => void;
}

const PAGE_SIZE = 8;

function QuestionPickerContent({ lockedIds, onClose, onConfirm }: QuestionPickerContentProps) {
  const [messageApi, messageHolder] = message.useMessage();
  const { token } = theme.useToken();
  const [form] = Form.useForm<QuestionPickerFilters>();
  const [filters, setFilters] = useState<QuestionPickerFilters>({});
  const [page, setPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);
  const [records, setRecords] = useState<QuestionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<BankBrief[]>([]);
  const [picked, setPicked] = useState<Map<number, QuestionListItem>>(new Map());

  useEffect(() => {
    const controller = new AbortController();
    fetchAvailableBanks(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setBanks(data);
        }
      })
      .catch(() => {
        // 题库筛选加载失败不阻断选题，忽略即可。
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestions({ page, pageSize: PAGE_SIZE, ...filters }, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setRecords(result.records);
          setTotal(result.total);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          messageApi.error(cause instanceof ApiError ? cause.message : '加载试题失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, filters, refreshToken, messageApi]);

  const toggle = (record: QuestionListItem, selected: boolean) => {
    setPicked((previous) => {
      const next = new Map(previous);
      if (selected) {
        next.set(record.id, record);
      } else {
        next.delete(record.id);
      }
      return next;
    });
  };

  const rowSelection: TableProps<QuestionListItem>['rowSelection'] = {
    selectedRowKeys: Array.from(picked.keys()),
    preserveSelectedRowKeys: true,
    getCheckboxProps: (record) => ({ disabled: lockedIds.has(record.id) }),
    onSelect: (record, selected) => toggle(record, selected),
    onSelectAll: (selected, _rows, changeRows) => {
      setPicked((previous) => {
        const next = new Map(previous);
        for (const row of changeRows) {
          if (selected) {
            next.set(row.id, row);
          } else {
            next.delete(row.id);
          }
        }
        return next;
      });
    },
  };

  const columns: TableProps<QuestionListItem>['columns'] = [
    {
      title: '题干',
      dataIndex: 'content',
      key: 'content',
      ellipsis: { showTitle: false },
      render: (content: string) => (
        <Typography.Text ellipsis={{ tooltip: content }} style={{ maxWidth: 380 }}>
          {content}
        </Typography.Text>
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
      width: 180,
      render: (bank: QuestionListItem['questionBank']) =>
        bank ? <Tag>{bank.title}</Tag> : <Typography.Text type="secondary">未归类</Typography.Text>,
    },
  ];

  const handleSearch = (values: QuestionPickerFilters) => {
    setLoading(true);
    setFilters(values);
    setPage(1);
    setRefreshToken((value) => value + 1);
  };

  const handleReset = () => {
    setLoading(true);
    form.resetFields();
    setFilters({});
    setPage(1);
    setRefreshToken((value) => value + 1);
  };

  return (
    <Flex vertical gap={16} style={{ minHeight: '100%' }}>
      {messageHolder}
      <Form form={form} layout="inline" onFinish={handleSearch} style={{ rowGap: 12 }}>
        <Form.Item name="keyword">
          <Input allowClear placeholder="搜索题干" style={{ width: 200 }} aria-label="搜索题干" />
        </Form.Item>
        <Form.Item name="questionType">
          <Select
            allowClear
            placeholder="题型"
            options={QUESTION_TYPE_OPTIONS}
            style={{ width: 110 }}
            aria-label="题型"
          />
        </Form.Item>
        <Form.Item name="difficulty">
          <Select
            allowClear
            placeholder="难度"
            options={QUESTION_DIFFICULTY_OPTIONS}
            style={{ width: 110 }}
            aria-label="难度"
          />
        </Form.Item>
        <Form.Item name="questionBankId">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="题库"
            style={{ width: 160 }}
            options={banks.map((bank) => ({ value: bank.id, label: bank.title }))}
            aria-label="题库"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table<QuestionListItem>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={records}
        loading={loading}
        rowSelection={rowSelection}
        scroll={{ x: 760 }}
        locale={{
          emptyText: <Empty description="没有可选的试题" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          onChange: (nextPage) => {
            setLoading(true);
            setPage(nextPage);
          },
          showTotal: (value) => `共 ${value} 道`,
        }}
      />
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          marginTop: 'auto',
          paddingTop: 12,
          paddingBottom: 4,
          background: token.colorBgContainer,
        }}
      >
        <Flex justify="space-between" align="center" gap={12} wrap>
          <Typography.Text type="secondary">
            已选 {picked.size} 道（试卷中已有 {lockedIds.size} 道）
          </Typography.Text>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              disabled={picked.size === 0}
              onClick={() => onConfirm(Array.from(picked.values()))}
            >
              添加 {picked.size > 0 ? `(${picked.size})` : ''}
            </Button>
          </Space>
        </Flex>
      </div>
    </Flex>
  );
}

interface QuestionPickerDrawerProps {
  open: boolean;
  /** 已加入试卷的题目，禁止重复选择。 */
  lockedIds: Set<number>;
  onClose: () => void;
  onConfirm: (questions: QuestionListItem[]) => void;
}

export default function QuestionPickerDrawer({
  open,
  lockedIds,
  onClose,
  onConfirm,
}: QuestionPickerDrawerProps) {
  const screens = Grid.useBreakpoint();
  return (
    <Drawer
      open={open}
      size={screens.sm ? 960 : 'default'}
      title="选择题目"
      onClose={onClose}
      destroyOnHidden
    >
      {open ? (
        <QuestionPickerContent
          lockedIds={lockedIds}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      ) : null}
    </Drawer>
  );
}
