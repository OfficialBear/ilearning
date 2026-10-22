import { SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import { PAPER_STATUS_OPTIONS } from '../paperMeta';
import type { PaperFilters } from '../types';

interface PaperFilterBarProps {
  loading?: boolean;
  stacked?: boolean;
  onSearch: (filters: PaperFilters) => void;
  onReset: () => void;
}

export default function PaperFilterBar({
  loading = false,
  stacked = false,
  onSearch,
  onReset,
}: PaperFilterBarProps) {
  const [form] = Form.useForm<PaperFilters>();
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
          placeholder="搜索试卷名称或描述"
          style={{ width: stacked ? '100%' : 280 }}
          aria-label="搜索试卷"
        />
      </Form.Item>
      <Form.Item name="status" style={itemStyle}>
        <Select
          allowClear
          placeholder="状态"
          options={PAPER_STATUS_OPTIONS}
          style={{ width: stacked ? '100%' : 130 }}
          aria-label="试卷状态"
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
