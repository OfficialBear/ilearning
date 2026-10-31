import {
  Alert,
  Button,
  Card,
  Flex,
  Grid,
  Result,
  Skeleton,
  Tag,
  Typography,
  theme,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { QUESTION_DIFFICULTY_META, QUESTION_TYPE_META } from '@/pages/questions/questionMeta';
import { fetchAttemptResult } from '@/services/userExams';
import type { AttemptResult, AttemptResultQuestion } from '@/types/attempt';
import { formatDateTime, formatScore } from '@/utils/format';
import { ApiError } from '@/utils/request';
import { formatSeconds, resultOutcome } from './attemptMeta';

function QuestionResult({ question }: { question: AttemptResultQuestion }) {
  const { token } = theme.useToken();
  const selected = new Set(question.selectedOptionKeys);
  const unanswered = question.selectedOptionKeys.length === 0 && !question.textAnswer;
  const outcome = question.isCorrect
    ? { label: '答对', color: 'green' }
    : question.isCorrect === false
      ? { label: unanswered ? '未作答' : '答错', color: 'red' }
      : { label: '待评分', color: 'orange' };
  return (
    <Card styles={{ body: { padding: 16 } }}>
      <Flex vertical gap={12}>
        <Flex justify="space-between" align="center" wrap gap={8}>
          <Flex align="center" gap={8} wrap>
            <Typography.Text strong>第 {question.sort} 题</Typography.Text>
            <Tag color={QUESTION_TYPE_META[question.questionType].color}>
              {QUESTION_TYPE_META[question.questionType].label}
            </Tag>
            <Tag>{QUESTION_DIFFICULTY_META[question.difficulty].label}</Tag>
            <Typography.Text type="secondary">
              得分 {question.actualScore == null ? '待定' : formatScore(question.actualScore)} /{' '}
              {formatScore(question.score)}
            </Typography.Text>
          </Flex>
          <Tag color={outcome.color}>{outcome.label}</Tag>
        </Flex>

        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
          {question.content}
        </Typography.Paragraph>

        {question.options.length > 0 ? (
          <Flex vertical gap={8}>
            {question.options.map((option) => {
              const isSelected = selected.has(option.optionKey);
              const isCorrect = option.isCorrect === 1;
              return (
                <Flex
                  key={option.optionKey}
                  gap={8}
                  align="flex-start"
                  style={{
                    padding: '8px 10px',
                    borderRadius: token.borderRadius,
                    border: `1px solid ${
                      isCorrect
                        ? token.colorSuccessBorder
                        : isSelected
                          ? token.colorPrimaryBorder
                          : token.colorBorderSecondary
                    }`,
                    background: isCorrect
                      ? token.colorSuccessBg
                      : isSelected
                        ? token.colorPrimaryBg
                        : undefined,
                  }}
                >
                  <Typography.Text strong>{option.optionKey}.</Typography.Text>
                  <Typography.Text style={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                    {option.content}
                  </Typography.Text>
                  {isSelected ? <Tag color="blue">你的选择</Tag> : null}
                  {isCorrect ? <Tag color="green">正确答案</Tag> : null}
                </Flex>
              );
            })}
          </Flex>
        ) : null}

        {question.questionType === 4 ? (
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">你的答案</Typography.Text>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {question.textAnswer || '未作答'}
            </Typography.Paragraph>
          </Flex>
        ) : null}

        {question.analysis ? (
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">解析</Typography.Text>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {question.analysis}
            </Typography.Paragraph>
          </Flex>
        ) : null}
      </Flex>
    </Card>
  );
}

export default function AttemptResultPage() {
  const navigate = useNavigate();
  const { attemptId: attemptIdParam } = useParams();
  const attemptId = Number(attemptIdParam);
  const screens = Grid.useBreakpoint();
  const isWide = screens.md ?? false;
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(attemptId)) {
      navigate('/exam-center', { replace: true });
      return;
    }
    const controller = new AbortController();
    fetchAttemptResult(attemptId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult(data);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof ApiError ? cause.message : '加载成绩失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [attemptId, navigate, reloadToken]);

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (error || !result) {
    return (
      <Result
        status="error"
        title="无法查看成绩"
        subTitle={error ?? '成绩不存在'}
        extra={[
          <Button
            key="retry"
            type="primary"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadToken((value) => value + 1);
            }}
          >
            重试
          </Button>,
          <Button key="back" onClick={() => navigate('/exam-center?tab=history')}>
            返回考试记录
          </Button>,
        ]}
      />
    );
  }

  const outcome = resultOutcome(result);

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex
          vertical={!isWide}
          justify="space-between"
          align={isWide ? 'center' : 'stretch'}
          gap={16}
        >
          <Flex vertical gap={6}>
            <Flex align="center" gap={8} wrap>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {result.examTitle}
              </Typography.Title>
              <Tag color={outcome.color}>{outcome.label}</Tag>
            </Flex>
            <Typography.Text type="secondary">
              第 {result.attemptNo} 次 · 交卷 {formatDateTime(result.submittedAt)} · 用时{' '}
              {formatSeconds(result.timeSpentSeconds)}
            </Typography.Text>
          </Flex>
          <Flex align="baseline" gap={6}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {formatScore(result.userScore)}
            </Typography.Title>
            <Typography.Text type="secondary">
              / {formatScore(result.totalScore)} 分 · 及格 {formatScore(result.passingScore)}
            </Typography.Text>
          </Flex>
        </Flex>
      </Card>

      {result.pendingManualGrading ? (
        <Alert
          type="warning"
          showIcon
          message="本场考试包含需要人工评分的题目"
          description="客观题已判分；简答题提交后由管理员评分，最终成绩以评分完成后的结果为准。"
        />
      ) : null}

      <Flex vertical gap={12}>
        {result.questions.map((question) => (
          <QuestionResult key={question.paperQuestionId} question={question} />
        ))}
      </Flex>

      <Flex justify="center" gap={12} wrap>
        <Button type="primary" onClick={() => navigate('/exam-center')}>
          返回考试中心
        </Button>
        <Button onClick={() => navigate('/exam-center?tab=history')}>查看考试记录</Button>
      </Flex>
    </Flex>
  );
}
