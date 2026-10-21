import { SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import type { BankBrief } from '@/types/question';
import { QUESTION_DIFFICULTY_OPTIONS, QUESTION_TYPE_OPTIONS } from '../questionMeta';
import type { QuestionFilters } from '../types';

interface QuestionFilterBarProps {
  banks: BankBrief[];
  loading?: boolean;
  stacked?: boolean;
  onSearch: (filters: QuestionFilters) => void;
  onReset: () => void;
}

export default function QuestionFilterBar({
  banks,
  loading = false,
  stacked = false,
  onSearch,
  onReset,
}: QuestionFilterBarProps) {
  const [form] = Form.useForm<QuestionFilters>();
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
          placeholder="搜索题干"
          style={{ width: stacked ? '100%' : 240 }}
          aria-label="搜索题干"
        />
      </Form.Item>
      <Form.Item name="questionType" style={itemStyle}>
        <Select
          allowClear
          placeholder="题型"
          options={QUESTION_TYPE_OPTIONS}
          style={{ width: stacked ? '100%' : 110 }}
          aria-label="题型"
        />
      </Form.Item>
      <Form.Item name="difficulty" style={itemStyle}>
        <Select
          allowClear
          placeholder="难度"
          options={QUESTION_DIFFICULTY_OPTIONS}
          style={{ width: stacked ? '100%' : 110 }}
          aria-label="难度"
        />
      </Form.Item>
      <Form.Item name="questionBankId" style={itemStyle}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="题库"
          style={{ width: stacked ? '100%' : 180 }}
          options={banks.map((bank) => ({
            value: bank.id,
            label: bank.title,
          }))}
          aria-label="题库"
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
