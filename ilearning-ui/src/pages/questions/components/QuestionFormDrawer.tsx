import {
  Alert,
  Button,
  Col,
  Drawer,
  Flex,
  Form,
  Input,
  Result,
  Row,
  Select,
  Skeleton,
  message,
  theme,
} from 'antd';
import { useEffect, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { createQuestion, fetchQuestionDetail, updateQuestion } from '@/services/questions';
import type {
  BankBrief,
  QuestionDetail,
  QuestionDifficulty,
  QuestionOptionPayload,
  QuestionSavePayload,
  QuestionType,
} from '@/types/question';
import { ApiError } from '@/utils/request';
import type { OptionFormValue, QuestionFormValues } from '../formTypes';
import { QUESTION_DIFFICULTY_OPTIONS, QUESTION_TYPE_OPTIONS } from '../questionMeta';
import OptionEditor from './OptionEditor';

interface QuestionFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  questionId: number | null;
  banks: BankBrief[];
  onClose: () => void;
  onSaved: () => void;
}

interface QuestionFormContentProps {
  mode: 'create' | 'edit';
  questionId: number | null;
  banks: BankBrief[];
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_OPTION: OptionFormValue = { content: '', imageUrl: '' };

function createOptions(type: QuestionType, current?: OptionFormValue[]): OptionFormValue[] {
  if (type === 4) {
    return [];
  }
  if (type === 3) {
    return [
      { content: '正确', imageUrl: '' },
      { content: '错误', imageUrl: '' },
    ];
  }
  const minimum = type === 2 ? 4 : 2;
  const source = current ?? [];
  const count = Math.max(source.length, minimum);
  return Array.from({ length: count }, (_, index) => source[index] ?? { ...EMPTY_OPTION });
}

function createInitialValues(): QuestionFormValues {
  return {
    questionType: 1,
    difficulty: 1,
    content: '',
    imageUrl: '',
    analysis: '',
    questionBankId: undefined,
    options: createOptions(1),
    correctIndex: 0,
    correctIndexes: [],
  };
}

function toFormOptions(detail: QuestionDetail): OptionFormValue[] {
  return detail.options.map((option) => ({
    content: option.content,
    imageUrl: option.imageUrl,
  }));
}

function correctFields(
  detail: QuestionDetail,
): Pick<QuestionFormValues, 'correctIndex' | 'correctIndexes'> {
  const indexes = detail.options
    .map((option, index) => (option.isCorrect === 1 ? index : -1))
    .filter((index) => index >= 0);
  if (detail.questionType === 2) {
    return { correctIndexes: indexes, correctIndex: undefined };
  }
  if (detail.questionType === 4) {
    return { correctIndex: undefined, correctIndexes: [] };
  }
  return { correctIndex: indexes[0], correctIndexes: [] };
}

function QuestionFormContent({
  mode,
  questionId,
  banks,
  onClose,
  onSaved,
}: QuestionFormContentProps) {
  const [form] = Form.useForm<QuestionFormValues>();
  const [messageApi, messageHolder] = message.useMessage();
  const [loading, setLoading] = useState(mode === 'edit' && questionId != null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [detail, setDetail] = useState<QuestionDetail | null>(null);
  const { token } = theme.useToken();

  const watchedType = Form.useWatch('questionType', form) as QuestionType | undefined;
  const type: QuestionType = watchedType ?? 1;
  const isSaq = type === 4;
  const referenced = detail?.paperReferenceCount ?? 0;
  const protectedDisabled = mode === 'edit' && referenced > 0;

  useEffect(() => {
    if (mode !== 'edit' || questionId == null) {
      return;
    }
    const controller = new AbortController();
    fetchQuestionDetail(questionId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setDetail(data);
        form.setFieldsValue({
          questionType: data.questionType,
          difficulty: data.difficulty,
          content: data.content,
          imageUrl: data.imageUrl,
          analysis: data.analysis,
          questionBankId: data.questionBankId ?? undefined,
          options: toFormOptions(data),
          ...correctFields(data),
        });
        setLoadError(null);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setLoadError(cause instanceof ApiError ? cause.message : '加载试题详情失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [mode, questionId, reloadToken, form]);

  const retry = () => {
    setLoadError(null);
    setLoading(true);
    setReloadToken((value) => value + 1);
  };

  const handleTypeChange = (nextType: QuestionType) => {
    const currentOptions = (form.getFieldValue('options') as OptionFormValue[] | undefined) ?? [];
    const looksLikeJudgeOptions =
      currentOptions.length === 2 &&
      currentOptions[0]?.content === '正确' &&
      currentOptions[1]?.content === '错误';
    const source =
      looksLikeJudgeOptions && (nextType === 1 || nextType === 2)
        ? undefined
        : currentOptions;
    const nextOptions = createOptions(nextType, source);
    const nextCorrect =
      nextType === 2 || nextType === 4
        ? { correctIndex: undefined, correctIndexes: [] }
        : { correctIndex: 0, correctIndexes: [] };
    form.setFieldsValue({ questionType: nextType, options: nextOptions, ...nextCorrect });
  };

  const handleSubmit = async () => {
    let values: QuestionFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const correctSet = new Set<number>();
    if (values.questionType === 2) {
      (values.correctIndexes ?? []).forEach((index) => correctSet.add(index));
    } else if (values.questionType === 1 || values.questionType === 3) {
      if (values.correctIndex !== undefined) {
        correctSet.add(values.correctIndex);
      }
    }

    const options: QuestionOptionPayload[] =
      values.questionType === 4
        ? []
        : (values.options ?? []).map((option, index) => ({
            content: option.content.trim(),
            imageUrl: option.imageUrl?.trim() ?? '',
            isCorrect: correctSet.has(index) ? 1 : 0,
          }));

    const questionBankId = values.questionBankId;
    if (questionBankId === undefined) {
      messageApi.error('请选择所属题库');
      return;
    }

    const payload: QuestionSavePayload = {
      questionType: values.questionType,
      difficulty: values.difficulty,
      content: values.content.trim(),
      imageUrl: values.imageUrl?.trim() ?? '',
      analysis: values.analysis?.trim() ?? '',
      questionBankId,
      options,
    };

    setSaving(true);
    try {
      if (mode === 'edit' && questionId != null) {
        await updateQuestion(questionId, payload);
        messageApi.success('试题已更新');
      } else {
        await createQuestion(payload);
        messageApi.success('试题已创建');
      }
      onSaved();
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '保存试题失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {messageHolder}
      {loading ? <Skeleton active paragraph={{ rows: 10 }} /> : null}
      {!loading && loadError ? (
        <Result
          status="error"
          title="加载失败"
          subTitle={loadError}
          extra={
            <Button type="primary" onClick={retry}>
              重试
            </Button>
          }
        />
      ) : null}
      <Form
        form={form}
        layout="vertical"
        initialValues={createInitialValues()}
        style={{ display: loading || loadError ? 'none' : undefined }}
      >
        {protectedDisabled ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message={`该试题已被 ${referenced} 份试卷引用，题干、选项和正确答案不可修改；如需变更请使用复制功能。`}
          />
        ) : null}
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item
              label="题型"
              name="questionType"
              rules={[{ required: true, message: '请选择题型' }]}
            >
              <Select<QuestionType>
                options={QUESTION_TYPE_OPTIONS}
                onChange={handleTypeChange}
                disabled={protectedDisabled}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              label="难度"
              name="difficulty"
              rules={[{ required: true, message: '请选择难度' }]}
            >
              <Select<QuestionDifficulty>
                options={QUESTION_DIFFICULTY_OPTIONS}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="所属题库"
              name="questionBankId"
              rules={[{ required: true, message: '请选择所属题库' }]}
            >
              <Select<number>
                showSearch
                optionFilterProp="label"
                placeholder="选择所属题库"
                style={{ width: '100%' }}
                options={banks.map((bank) => ({
                  value: bank.id,
                  label: bank.title,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="题干"
          name="content"
          rules={[
            { required: true, message: '请输入题干' },
            { max: 2000, message: '题干最长 2000 位' },
          ]}
        >
          <Input.TextArea
            rows={4}
            maxLength={2000}
            showCount
            placeholder="请输入题干"
            disabled={protectedDisabled}
          />
        </Form.Item>
        <Form.Item label="题目图片" name="imageUrl">
          <ImageUpload disabled={protectedDisabled} />
        </Form.Item>
        <Form.Item
          label={isSaq ? '参考答案 / 解析' : '试题解析'}
          name="analysis"
          rules={[{ max: 2000, message: '内容最长 2000 位' }]}
        >
          <Input.TextArea
            rows={4}
            maxLength={2000}
            showCount
            placeholder={isSaq ? '简答题无选项，此处内容作为参考答案和解析' : '请输入试题解析'}
          />
        </Form.Item>
        {!isSaq ? <OptionEditor form={form} type={type} disabled={protectedDisabled} /> : null}
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
          <Button
            type="primary"
            loading={saving}
            disabled={loading || Boolean(loadError)}
            onClick={() => void handleSubmit()}
          >
            保存
          </Button>
        </Flex>
      </div>
    </>
  );
}

export default function QuestionFormDrawer({
  open,
  mode,
  questionId,
  banks,
  onClose,
  onSaved,
}: QuestionFormDrawerProps) {
  return (
    <Drawer
      open={open}
      size={760}
      title={mode === 'edit' ? '编辑试题' : '新增试题'}
      onClose={onClose}
      destroyOnHidden
    >
      {open ? (
        <QuestionFormContent
          key={mode === 'edit' ? `edit-${questionId ?? 'none'}` : 'create'}
          mode={mode}
          questionId={questionId}
          banks={banks}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Drawer>
  );
}
