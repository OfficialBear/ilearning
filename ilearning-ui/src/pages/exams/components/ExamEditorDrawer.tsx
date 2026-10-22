import {
  Alert,
  Button,
  Col,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  Typography,
  message,
  theme,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { createExam, fetchExamDetail, updateExam } from '@/services/exams';
import { fetchPapers } from '@/services/papers';
import type { ExamDetail, ExamSavePayload } from '@/types/exam';
import type { PaperListItem } from '@/types/paper';
import { formatScore } from '@/utils/format';
import { ApiError } from '@/utils/request';

interface ExamFormValues {
  paperId: number;
  title: string;
  description?: string;
  range?: [Dayjs | null, Dayjs | null] | null;
  durationMinutes: number;
  maxAttempts: number;
  passingScore: number;
}

interface PaperOption {
  id: number;
  title: string;
  totalScore: number;
  status: PaperListItem['status'];
}

interface ExamEditorContentProps {
  examId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

function toFormValues(detail: ExamDetail): ExamFormValues {
  return {
    paperId: detail.paperId,
    title: detail.title,
    description: detail.description,
    range: [
      detail.startTime ? dayjs(detail.startTime) : null,
      detail.endTime ? dayjs(detail.endTime) : null,
    ],
    durationMinutes: detail.durationMinutes,
    maxAttempts: detail.maxAttempts,
    passingScore: detail.passingScore,
  };
}

function ExamEditorContent({ examId, onClose, onSaved }: ExamEditorContentProps) {
  const { token } = theme.useToken();
  const [form] = Form.useForm<ExamFormValues>();
  const [messageApi, messageHolder] = message.useMessage();
  const [loading, setLoading] = useState(examId != null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [papers, setPapers] = useState<PaperListItem[]>([]);
  const [paperKeyword, setPaperKeyword] = useState('');
  const [paperLoading, setPaperLoading] = useState(true);
  const selectedPaperId = Form.useWatch('paperId', form);

  useEffect(() => {
    if (examId == null) {
      return;
    }
    const controller = new AbortController();
    fetchExamDetail(examId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setDetail(data);
        form.setFieldsValue(toFormValues(data));
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          messageApi.error(cause instanceof ApiError ? cause.message : '加载考试失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [examId, form, messageApi]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setPaperLoading(true);
      fetchPapers(
        {
          page: 1,
          pageSize: 50,
          status: 1,
          keyword: paperKeyword.trim() || undefined,
        },
        controller.signal,
      )
        .then((result) => {
          if (!controller.signal.aborted) {
            setPapers(result.records);
          }
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted) {
            messageApi.error(cause instanceof ApiError ? cause.message : '加载试卷失败');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setPaperLoading(false);
          }
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [paperKeyword, messageApi]);

  const paperOptions = useMemo(() => {
    const map = new Map<number, PaperOption>();
    for (const paper of papers) {
      map.set(paper.id, {
        id: paper.id,
        title: paper.title,
        totalScore: paper.totalScore,
        status: paper.status,
      });
    }
    if (detail && !map.has(detail.paperId)) {
      map.set(detail.paperId, {
        id: detail.paperId,
        title: detail.paperTitle,
        totalScore: detail.paperTotalScore,
        status: detail.paperStatus,
      });
    }
    return [...map.values()];
  }, [papers, detail]);

  const selectedPaper = paperOptions.find((paper) => paper.id === selectedPaperId);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: ExamSavePayload = {
        paperId: values.paperId,
        title: values.title.trim(),
        description: values.description?.trim() ?? '',
        durationMinutes: values.durationMinutes,
        maxAttempts: values.maxAttempts,
        passingScore: values.passingScore,
        startTime: values.range?.[0]?.format('YYYY-MM-DDTHH:mm:ss') ?? null,
        endTime: values.range?.[1]?.format('YYYY-MM-DDTHH:mm:ss') ?? null,
      };
      setSaving(true);
      if (examId == null) {
        await createExam(payload);
        messageApi.success('考试草稿已创建');
      } else {
        await updateExam(examId, payload);
        messageApi.success('考试草稿已保存');
      }
      onSaved();
    } catch (cause) {
      if (cause instanceof ApiError) {
        messageApi.error(cause.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <>
      {messageHolder}
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          description: '',
          durationMinutes: 0,
          maxAttempts: 0,
          passingScore: 0,
          range: [null, null],
        }}
        onFinish={() => void handleSubmit()}
      >
        <Form.Item
          name="title"
          label="考试名称"
          rules={[
            { required: true, whitespace: true, message: '请输入考试名称' },
            { max: 128, message: '考试名称最长 128 位' },
          ]}
        >
          <Input placeholder="例如：羽毛球规则月度考试" maxLength={128} showCount />
        </Form.Item>

        <Form.Item
          name="paperId"
          label="试卷"
          extra="只能引用已发布的试卷；发布考试时会再次校验试卷状态。"
          rules={[{ required: true, message: '请选择试卷' }]}
        >
          <Select
            showSearch
            filterOption={false}
            loading={paperLoading}
            onSearch={setPaperKeyword}
            placeholder="搜索并选择已发布试卷"
            notFoundContent={paperLoading ? '搜索中…' : '没有可用的已发布试卷'}
            options={paperOptions.map((paper) => ({
              value: paper.id,
              label: `${paper.title} · ${formatScore(paper.totalScore)} 分${
                paper.status === 1 ? '' : '（不可用）'
              }`,
            }))}
          />
        </Form.Item>

        {selectedPaper ? (
          <Flex vertical gap={8} style={{ marginTop: -8, marginBottom: 16 }}>
            <Typography.Text type="secondary">
              试卷总分 {formatScore(selectedPaper.totalScore)}，及格线不得超过该值。
            </Typography.Text>
            {selectedPaper.status !== 1 ? (
              <Alert
                type="warning"
                showIcon
                message="该试卷当前不可用"
                description="试卷已归档或未发布，可继续保存草稿，但无法发布考试。"
              />
            ) : null}
          </Flex>
        ) : null}

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="durationMinutes"
              label="单次时长（分钟）"
              extra="0 表示不限时"
              rules={[{ required: true, message: '请输入考试时长' }]}
            >
              <InputNumber
                min={0}
                max={65535}
                precision={0}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="maxAttempts"
              label="参加次数"
              extra="0 表示不限次数"
              rules={[{ required: true, message: '请输入参加次数' }]}
            >
              <InputNumber
                min={0}
                max={65535}
                precision={0}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="passingScore"
          label="及格分数"
          rules={[
            { required: true, message: '请输入及格分数' },
            {
              validator: (_, value: number | null | undefined) => {
                if (value == null || !selectedPaper) {
                  return Promise.resolve();
                }
                if (Number(value) > Number(selectedPaper.totalScore)) {
                  return Promise.reject(
                    new Error(`及格分数不能超过试卷总分 ${formatScore(selectedPaper.totalScore)}`),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            max={999999.99}
            precision={2}
            style={{ width: '100%' }}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item
          name="range"
          label="开放时间"
          extra="留空表示不限制；可以只限制开始或结束时间。"
          rules={[
            {
              validator: (_, value: [Dayjs | null, Dayjs | null] | null | undefined) => {
                const start = value?.[0];
                const end = value?.[1];
                if (start && end && !end.isAfter(start)) {
                  return Promise.reject(new Error('结束时间必须晚于开始时间'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker.RangePicker
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            allowEmpty={[true, true]}
            style={{ width: '100%' }}
            placeholder={['开始时间（不限）', '结束时间（不限）']}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="考试说明"
          rules={[{ max: 1000, message: '考试说明最长 1000 位' }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={1000}
            showCount
            placeholder="考试范围、注意事项等"
          />
        </Form.Item>

        <Flex
          justify="flex-end"
          gap={8}
          style={{
            position: 'sticky',
            bottom: 0,
            padding: '12px 0',
            background: token.colorBgElevated,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存草稿
          </Button>
        </Flex>
      </Form>
    </>
  );
}

interface ExamEditorDrawerProps {
  open: boolean;
  examId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ExamEditorDrawer({
  open,
  examId,
  onClose,
  onSaved,
}: ExamEditorDrawerProps) {
  const screens = Grid.useBreakpoint();
  return (
    <Drawer
      open={open}
      size={screens.sm ? 720 : 'default'}
      title={examId == null ? '新增考试' : '编辑考试'}
      onClose={onClose}
      destroyOnHidden
    >
      {open ? (
        <ExamEditorContent
          key={examId == null ? 'new' : `edit-${examId}`}
          examId={examId}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Drawer>
  );
}
