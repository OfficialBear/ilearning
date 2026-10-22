import { SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import type { ExamStatus } from '@/types/exam';
import { EXAM_STATUS_OPTIONS } from '../examMeta';

interface ExamFilterBarProps {
  loading?: boolean;
  stacked?: boolean;
  onSearch: (filters: { keyword?: string; status?: ExamStatus }) => void;
  onReset: () => void;
}

export default function ExamFilterBar({
  loading = false,
  stacked = false,
  onSearch,
  onReset,
}: ExamFilterBarProps) {
  const [form] = Form.useForm<{ keyword?: string; status?: ExamStatus }>();
  const itemStyle = stacked ? { width: '100%', marginInlineEnd: 0 } : undefined;

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={onSearch}
      style={{
        flex: 1,
        minWidth: 0,
        rowGap: 12,
        width: stacked ? '100%' : undefined,
      }}
    >
      <Form.Item name="keyword" style={itemStyle}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索考试名称、说明或试卷"
          style={{ width: stacked ? '100%' : 300 }}
          aria-label="搜索考试"
        />
      </Form.Item>
      <Form.Item name="status" style={itemStyle}>
        <Select
          allowClear
          placeholder="状态"
          options={EXAM_STATUS_OPTIONS}
          style={{ width: stacked ? '100%' : 130 }}
          aria-label="考试状态"
        />
      </Form.Item>
      <Form.Item style={itemStyle}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
