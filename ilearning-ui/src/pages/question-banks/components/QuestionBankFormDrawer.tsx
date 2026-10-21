import { Alert, Button, Drawer, Flex, Form, Input, InputNumber, Radio, message, theme } from 'antd';
import { useState } from 'react';
import {
  createQuestionBank,
  updateQuestionBank,
} from '@/services/questionBanks';
import type { BankStatus, QuestionBankListItem, QuestionBankSavePayload } from '@/types/question';
import { ApiError } from '@/utils/request';
import { BANK_STATUS_OPTIONS } from '../questionBankMeta';

interface QuestionBankFormValues {
  title: string;
  description?: string;
  sort: number;
  status: BankStatus;
}

interface QuestionBankFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  record: QuestionBankListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

interface QuestionBankFormContentProps {
  mode: 'create' | 'edit';
  record: QuestionBankListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function initialValues(record: QuestionBankListItem | null): QuestionBankFormValues {
  return {
    title: record?.title ?? '',
    description: record?.description ?? '',
    sort: record?.sort ?? 0,
    status: record?.status ?? 1,
  };
}

function QuestionBankFormContent({
  mode,
  record,
  onClose,
  onSaved,
}: QuestionBankFormContentProps) {
  const [form] = Form.useForm<QuestionBankFormValues>();
  const [messageApi, messageHolder] = message.useMessage();
  const [saving, setSaving] = useState(false);
  const { token } = theme.useToken();

  const handleSubmit = async () => {
    let values: QuestionBankFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const payload: QuestionBankSavePayload = {
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      sort: values.sort ?? 0,
      status: values.status,
    };

    setSaving(true);
    try {
      if (mode === 'edit' && record != null) {
        await updateQuestionBank(record.id, payload);
        messageApi.success('题库已更新');
      } else {
        await createQuestionBank(payload);
        messageApi.success('题库已创建');
      }
      onSaved();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '保存题库失败');
    } finally {
      setSaving(false);
    }
  };

  const totalQuestions = record?.totalQuestions ?? 0;
  const enabledQuestions = record?.enabledQuestions ?? 0;

  return (
    <>
      {messageHolder}
      {mode === 'edit' && totalQuestions > 0 ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={`该题库现有 ${totalQuestions} 道试题（启用 ${enabledQuestions} 道）`}
          description="修改名称、描述和排序不会影响已有试题；停用后无法继续在该题库下新增试题。"
        />
      ) : null}
      <Form form={form} layout="vertical" initialValues={initialValues(record)}>
        <Form.Item
          label="题库名称"
          name="title"
          rules={[
            { required: true, whitespace: true, message: '请输入题库名称' },
            { max: 128, message: '题库名称最长 128 位' },
          ]}
        >
          <Input maxLength={128} showCount placeholder="例如：羽毛球规则题库" />
        </Form.Item>
        <Form.Item
          label="题库描述"
          name="description"
          rules={[{ max: 500, message: '题库描述最长 500 位' }]}
        >
          <Input.TextArea
            rows={4}
            maxLength={500}
            showCount
            placeholder="说明题库的适用范围、内容来源等"
          />
        </Form.Item>
        <Flex gap={16} wrap>
          <Form.Item
            label="排序"
            name="sort"
            style={{ flex: '1 1 160px', marginBottom: 0 }}
            rules={[{ required: true, message: '请输入排序值' }]}
            extra="数值越小越靠前"
          >
            <InputNumber min={0} max={9999} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            style={{ flex: '1 1 220px', marginBottom: 0 }}
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Radio.Group optionType="button" buttonStyle="solid" options={BANK_STATUS_OPTIONS} />
          </Form.Item>
        </Flex>
      </Form>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          marginTop: 24,
          paddingTop: 16,
          paddingBottom: 8,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSubmit()}>
            保存
          </Button>
        </Flex>
      </div>
    </>
  );
}

export default function QuestionBankFormDrawer({
  open,
  mode,
  record,
  onClose,
  onSaved,
}: QuestionBankFormDrawerProps) {
  return (
    <Drawer
      open={open}
      size={520}
      title={mode === 'edit' ? '编辑题库' : '新增题库'}
      onClose={onClose}
      destroyOnHidden
    >
      {open ? (
        <QuestionBankFormContent
          key={mode === 'edit' ? `edit-${record?.id ?? 'none'}` : 'create'}
          mode={mode}
          record={record}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Drawer>
  );
}
