import { PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Drawer,
  Flex,
  Form,
  Grid,
  Input,
  InputNumber,
  Result,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { QUESTION_TYPE_META } from '@/pages/questions/questionMeta';
import { createPaper, fetchPaperDetail, updatePaper } from '@/services/papers';
import type { QuestionListItem } from '@/types/question';
import { ApiError } from '@/utils/request';
import { formatScore } from '../paperMeta';
import QuestionPickerDrawer from './QuestionPickerDrawer';

interface PaperFormValues {
  title: string;
  description?: string;
}

interface EditorQuestion {
  questionId: number;
  content: string;
  questionType: QuestionListItem['questionType'];
  difficulty: QuestionListItem['difficulty'];
  score: number;
}

interface PaperEditorContentProps {
  paperId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_SCORE = 5;

function PaperEditorContent({ paperId, onClose, onSaved }: PaperEditorContentProps) {
  const [form] = Form.useForm<PaperFormValues>();
  const [messageApi, messageHolder] = message.useMessage();
  const [loading, setLoading] = useState(paperId != null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [initial, setInitial] = useState<PaperFormValues>({ title: '', description: '' });
  const [selected, setSelected] = useState<EditorQuestion[]>([]);
  const [readOnly, setReadOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (paperId == null) {
      return;
    }
    const controller = new AbortController();
    fetchPaperDetail(paperId, controller.signal)
      .then((detail) => {
        if (controller.signal.aborted) {
          return;
        }
        setInitial({ title: detail.title, description: detail.description });
        setSelected(
          detail.questions.map((question) => ({
            questionId: question.questionId,
            content: question.content,
            questionType: question.questionType,
            difficulty: question.difficulty,
            score: Number(question.score),
          })),
        );
        setReadOnly(detail.status !== 0);
        setLoadError(null);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(cause instanceof ApiError ? cause.message : '加载试卷失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [paperId, reloadToken]);

  const totalScore = selected.reduce((sum, question) => sum + (question.score || 0), 0);

  const updateScore = (index: number, value: number | null) => {
    setSelected((previous) =>
      previous.map((question, current) =>
        current === index ? { ...question, score: value ?? 0 } : question,
      ),
    );
  };

  const move = (index: number, offset: number) => {
    setSelected((previous) => {
      const target = index + offset;
      if (target < 0 || target >= previous.length) {
        return previous;
      }
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (questionId: number) => {
    setSelected((previous) => previous.filter((question) => question.questionId !== questionId));
  };

  const handlePicked = (questions: QuestionListItem[]) => {
    const existing = new Set(selected.map((question) => question.questionId));
    const additions = questions
      .filter((question) => !existing.has(question.id))
      .map((question) => ({
        questionId: question.id,
        content: question.content,
        questionType: question.questionType,
        difficulty: question.difficulty,
        score: DEFAULT_SCORE,
      }));
    if (additions.length < questions.length) {
      messageApi.info('部分题目已在试卷中，已自动跳过');
    }
    if (additions.length > 0) {
      setSelected((previous) => [...previous, ...additions]);
    }
    setPickerOpen(false);
  };

  const handleSave = async () => {
    if (readOnly) {
      return;
    }
    let values: PaperFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (selected.some((question) => !Number.isFinite(question.score) || question.score <= 0)) {
      messageApi.error('请为每道题设置大于 0 的分值');
      return;
    }

    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      questions: selected.map((question) => ({
        questionId: question.questionId,
        score: question.score,
      })),
    };

    setSaving(true);
    try {
      if (paperId == null) {
        await createPaper(payload);
        messageApi.success('试卷已创建');
      } else {
        await updatePaper(paperId, payload);
        messageApi.success('试卷已保存');
      }
      onSaved();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '保存试卷失败');
    } finally {
      setSaving(false);
    }
  };

  const columns: TableProps<EditorQuestion>['columns'] = [
    {
      title: '题序',
      key: 'sort',
      width: 64,
      render: (_, __, index) => index + 1,
    },
    {
      title: '题干',
      dataIndex: 'content',
      key: 'content',
      ellipsis: { showTitle: false },
      render: (content: string) => (
        <Typography.Text ellipsis={{ tooltip: content }} style={{ maxWidth: 420 }}>
          {content}
        </Typography.Text>
      ),
    },
    {
      title: '题型',
      dataIndex: 'questionType',
      key: 'questionType',
      width: 90,
      render: (questionType: EditorQuestion['questionType']) => (
        <Tag color={QUESTION_TYPE_META[questionType]?.color}>
          {QUESTION_TYPE_META[questionType]?.label}
        </Tag>
      ),
    },
    {
      title: '分值',
      key: 'score',
      width: 120,
      render: (_, question, index) => (
        <InputNumber
          min={0.5}
          max={1000}
          step={0.5}
          precision={1}
          value={question.score}
          disabled={readOnly}
          onChange={(value) => updateScore(index, value)}
          style={{ width: 90 }}
          aria-label={`第 ${index + 1} 题分值`}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, question, index) => (
        <Space size={0} wrap>
          <Button
            type="link"
            size="small"
            disabled={readOnly || index === 0}
            onClick={() => move(index, -1)}
          >
            上移
          </Button>
          <Button
            type="link"
            size="small"
            disabled={readOnly || index === selected.length - 1}
            onClick={() => move(index, 1)}
          >
            下移
          </Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={readOnly}
            onClick={() => remove(question.questionId)}
          >
            移除
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }
  if (loadError) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={loadError}
        extra={
          <Button
            type="primary"
            onClick={() => {
              setLoading(true);
              setLoadError(null);
              setReloadToken((value) => value + 1);
            }}
          >
            重试
          </Button>
        }
      />
    );
  }

  return (
    <>
      {messageHolder}
      {readOnly ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="只有草稿状态的试卷可以编辑"
          description="已发布或已归档的试卷内容已冻结，请返回列表查看。"
        />
      ) : null}
      <Form
        form={form}
        layout="vertical"
        initialValues={initial}
        disabled={readOnly}
      >
        <Form.Item
          label="试卷名称"
          name="title"
          rules={[
            { required: true, whitespace: true, message: '请输入试卷名称' },
            { max: 128, message: '试卷名称最长 128 位' },
          ]}
        >
          <Input maxLength={128} showCount placeholder="例如：羽毛球规则月度考试" />
        </Form.Item>
        <Form.Item
          label="试卷描述"
          name="description"
          rules={[{ max: 1000, message: '试卷描述最长 1000 位' }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={1000}
            showCount
            placeholder="说明试卷的用途、范围或组卷思路"
          />
        </Form.Item>
      </Form>

      <Flex
        justify="space-between"
        align="center"
        gap={12}
        wrap
        style={{ marginTop: 8, marginBottom: 12 }}
      >
        <Space wrap>
          <Typography.Title level={5} style={{ margin: 0 }}>
            试卷题目
          </Typography.Title>
          <Typography.Text type="secondary">
            {selected.length} 题 · 总分 {formatScore(totalScore)}
          </Typography.Text>
        </Space>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setPickerOpen(true)}
          disabled={readOnly}
        >
          添加题目
        </Button>
      </Flex>
      <Table<EditorQuestion>
        rowKey="questionId"
        size="small"
        columns={columns}
        dataSource={selected}
        pagination={false}
        scroll={{ x: 720 }}
        locale={{ emptyText: '尚未添加题目' }}
      />

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          marginTop: 24,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} disabled={readOnly} onClick={() => void handleSave()}>
            保存草稿
          </Button>
        </Flex>
      </div>

      <QuestionPickerDrawer
        open={pickerOpen}
        lockedIds={new Set(selected.map((question) => question.questionId))}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePicked}
      />
    </>
  );
}

interface PaperEditorDrawerProps {
  open: boolean;
  paperId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PaperEditorDrawer({
  open,
  paperId,
  onClose,
  onSaved,
}: PaperEditorDrawerProps) {
  const screens = Grid.useBreakpoint();
  return (
    <Drawer
      open={open}
      size={screens.sm ? 1040 : 'default'}
      title={paperId == null ? '新增试卷' : '编辑试卷'}
      onClose={onClose}
      destroyOnHidden
    >
      {open ? (
        <PaperEditorContent
          key={paperId == null ? 'new' : `edit-${paperId}`}
          paperId={paperId}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Drawer>
  );
}
