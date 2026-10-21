import { SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import { BANK_STATUS_OPTIONS } from '../questionBankMeta';
import type { QuestionBankFilters } from '../types';

interface QuestionBankFilterBarProps {
  loading?: boolean;
  stacked?: boolean;
  onSearch: (filters: QuestionBankFilters) => void;
  onReset: () => void;
}

export default function QuestionBankFilterBar({
  loading = false,
  stacked = false,
  onSearch,
  onReset,
}: QuestionBankFilterBarProps) {
  const [form] = Form.useForm<QuestionBankFilters>();
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
          placeholder="搜索题库名称或描述"
          style={{ width: stacked ? '100%' : 260 }}
          aria-label="搜索题库"
        />
      </Form.Item>
      <Form.Item name="status" style={itemStyle}>
        <Select
          allowClear
          placeholder="状态"
          options={BANK_STATUS_OPTIONS}
          style={{ width: stacked ? '100%' : 120 }}
          aria-label="题库状态"
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
