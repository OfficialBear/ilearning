import { Alert, Button, Drawer, Empty, Flex, Grid, Image, Result, Skeleton, Tag, Typography, theme } from 'antd';
import { useEffect, useState } from 'react';
import { QUESTION_DIFFICULTY_META, QUESTION_TYPE_META } from '@/pages/questions/questionMeta';
import { fetchPaperDetail } from '@/services/papers';
import type { PaperDetail } from '@/types/paper';
import { ApiError } from '@/utils/request';
import { formatDateTime } from '@/utils/format';
import { formatScore, PAPER_STATUS_META } from '../paperMeta';

interface PaperDetailDrawerProps {
  open: boolean;
  paperId: number | null;
  onClose: () => void;
}

function PaperDetailContent({ paperId }: { paperId: number }) {
  const { token } = theme.useToken();
  const [detail, setDetail] = useState<PaperDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchPaperDetail(paperId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetail(data);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof ApiError ? cause.message : '加载试卷详情失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [paperId, reloadToken]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }
  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={
          <Button
            type="primary"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadToken((value) => value + 1);
            }}
          >
            重试
          </Button>
        }
      />
    );
  }
  if (!detail) {
    return null;
  }

  return (
    <Flex vertical gap={16}>
      <Flex wrap gap={8} align="center">
        <Tag color={PAPER_STATUS_META[detail.status].color}>
          {PAPER_STATUS_META[detail.status].label}
        </Tag>
        <Typography.Text type="secondary">
          {detail.questions.length} 题 · 总分 {formatScore(detail.totalScore)}
        </Typography.Text>
        <Typography.Text type="secondary">
          更新于 {formatDateTime(detail.updatedAt)}
        </Typography.Text>
      </Flex>
      {detail.description ? (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {detail.description}
        </Typography.Paragraph>
      ) : null}
      {detail.status !== 0 ? (
        <Alert
          type="info"
          showIcon
          message="已发布试卷以发布时的题目快照为准"
          description="之后修改题库中的题目不会改变本试卷的题干、选项和答案。"
        />
      ) : null}
      {detail.questions.length === 0 ? (
        <Empty description="尚未添加题目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Flex vertical gap={12}>
          {detail.questions.map((question) => (
            <div
              key={question.paperQuestionId}
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadius,
                padding: 14,
              }}
            >
              <Flex justify="space-between" align="flex-start" gap={12} wrap>
                <Flex gap={6} wrap align="center">
                  <Typography.Text strong>{question.sort}.</Typography.Text>
                  <Tag color={QUESTION_TYPE_META[question.questionType]?.color}>
                    {QUESTION_TYPE_META[question.questionType]?.label}
                  </Tag>
                  <Tag color={QUESTION_DIFFICULTY_META[question.difficulty]?.color}>
                    {QUESTION_DIFFICULTY_META[question.difficulty]?.label}
                  </Tag>
                  {question.snapshot ? <Tag color="blue">快照</Tag> : null}
                </Flex>
                <Tag color="gold">{formatScore(question.score)} 分</Tag>
              </Flex>
              <Typography.Paragraph style={{ margin: '10px 0 0' }}>
                {question.content}
              </Typography.Paragraph>
              {question.imageUrl ? (
                <Image src={question.imageUrl} width={240} style={{ marginTop: 8 }} />
              ) : null}
              {question.options.length > 0 ? (
                <Flex vertical gap={4} style={{ marginTop: 10 }}>
                  {question.options.map((option) => (
                    <Flex key={`${question.questionId}-${option.optionKey}`} gap={8} align="center" wrap>
                      <Typography.Text strong={option.isCorrect === 1}>
                        {option.optionKey}. {option.content}
                      </Typography.Text>
                      {option.isCorrect === 1 ? <Tag color="green">正确答案</Tag> : null}
                    </Flex>
                  ))}
                </Flex>
              ) : null}
              {question.analysis ? (
                <Typography.Paragraph type="secondary" style={{ margin: '10px 0 0', fontSize: 12 }}>
                  解析：{question.analysis}
                </Typography.Paragraph>
              ) : null}
            </div>
          ))}
        </Flex>
      )}
    </Flex>
  );
}

export default function PaperDetailDrawer({ open, paperId, onClose }: PaperDetailDrawerProps) {
  const screens = Grid.useBreakpoint();
  return (
    <Drawer
      open={open}
      size={screens.sm ? 880 : 'default'}
      title="试卷预览"
      onClose={onClose}
      destroyOnHidden
    >
      {open && paperId != null ? (
        <PaperDetailContent key={paperId} paperId={paperId} />
      ) : null}
    </Drawer>
  );
}
