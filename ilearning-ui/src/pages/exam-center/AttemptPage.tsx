import {
  Button,
  Card,
  Checkbox,
  Drawer,
  Flex,
  Grid,
  Image,
  Input,
  Modal,
  Radio,
  Result,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { QUESTION_DIFFICULTY_META, QUESTION_TYPE_META } from '@/pages/questions/questionMeta';
import { fetchAttemptPaper, saveAttemptAnswer, submitAttempt } from '@/services/userExams';
import type { AttemptPaper, AttemptQuestion } from '@/types/attempt';
import { ApiError } from '@/utils/request';
import { formatScore } from '@/utils/format';
import { formatDurationMinutes } from './attemptMeta';

interface LocalAnswer {
  optionKeys: string[];
  text: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const CONTENT_MAX_WIDTH = 1360;

function emptyAnswer(): LocalAnswer {
  return { optionKeys: [], text: '' };
}

function answerIsEmpty(answer: LocalAnswer | undefined): boolean {
  return !answer || (answer.optionKeys.length === 0 && answer.text.trim() === '');
}

function formatClock(millis: number): string {
  const totalSeconds = Math.max(0, Math.floor(millis / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function SaveBadge({ state }: { state: SaveState | undefined }) {
  if (!state || state === 'idle') {
    return null;
  }
  if (state === 'saving') {
    return <Tag color="processing">保存中…</Tag>;
  }
  if (state === 'saved') {
    return <Tag color="success">已保存</Tag>;
  }
  return <Tag color="error">保存失败</Tag>;
}

export default function AttemptPage() {
  const navigate = useNavigate();
  const { attemptId: attemptIdParam } = useParams();
  const attemptId = Number(attemptIdParam);
  const screens = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const isWide = screens.lg ?? false;
  const [messageApi, messageHolder] = message.useMessage();

  const [paper, setPaper] = useState<AttemptPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [answers, setAnswers] = useState<Record<number, LocalAnswer>>({});
  const [saveStates, setSaveStates] = useState<Record<number, SaveState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const pendingRef = useRef(new Map<number, LocalAnswer>());
  const submittingRef = useRef(false);
  const autoSubmittedRef = useRef(false);
  const finishRef = useRef<(auto: boolean) => void>(() => undefined);

  useEffect(() => {
    if (!Number.isFinite(attemptId)) {
      navigate('/exam-center', { replace: true });
      return;
    }
    const controller = new AbortController();
    fetchAttemptPaper(attemptId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setPaper(data);
        const initial: Record<number, LocalAnswer> = {};
        for (const question of data.questions) {
          initial[question.paperQuestionId] = {
            optionKeys: question.selectedOptionKeys ?? [],
            text: question.textAnswer ?? '',
          };
        }
        setAnswers(initial);
        setRemainingMs(
          data.deadlineMillis == null
            ? null
            : Math.max(0, data.deadlineMillis - data.serverTimeMillis),
        );
        setLoadError(null);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        const text = cause instanceof ApiError ? cause.message : '加载考试失败';
        const terminal = ['自动交卷', '已交卷', '不存在'].some((tokenText) =>
          text.includes(tokenText),
        );
        if (terminal) {
          messageApi.error(text);
          navigate('/exam-center?tab=history', { replace: true });
          return;
        }
        setLoadError(text);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [attemptId, navigate, messageApi, reloadToken]);

  useEffect(() => {
    if (!paper || paper.deadlineMillis == null) {
      return;
    }
    const localDeadline = Date.now() + Math.max(0, paper.deadlineMillis - paper.serverTimeMillis);
    const timer = setInterval(() => {
      const left = Math.max(0, localDeadline - Date.now());
      setRemainingMs(left);
      if (left <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        finishRef.current(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [paper]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    },
    [],
  );

  const questions = useMemo(() => paper?.questions ?? [], [paper]);
  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => questions.filter((question) => !answerIsEmpty(answers[question.paperQuestionId])).length,
    [questions, answers],
  );

  async function persistAnswer(questionId: number, answer: LocalAnswer) {
    setSaveStates((state) => ({ ...state, [questionId]: 'saving' }));
    try {
      await saveAttemptAnswer(attemptId, {
        paperQuestionId: questionId,
        optionKeys: answer.optionKeys,
        textAnswer: answer.text.trim() === '' ? null : answer.text,
      });
      pendingRef.current.delete(questionId);
      setSaveStates((state) => ({ ...state, [questionId]: 'saved' }));
    } catch (cause) {
      setSaveStates((state) => ({ ...state, [questionId]: 'error' }));
      throw cause;
    }
  }

  function updateAnswer(questionId: number, next: LocalAnswer) {
    setAnswers((state) => ({ ...state, [questionId]: next }));
    pendingRef.current.set(questionId, next);
    setSaveStates((state) => ({ ...state, [questionId]: 'idle' }));
    const existing = timersRef.current.get(questionId);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      timersRef.current.delete(questionId);
      void persistAnswer(questionId, next).catch(() => undefined);
    }, 600);
    timersRef.current.set(questionId, timer);
  }

  async function flushPending() {
    for (const timer of timersRef.current.values()) {
      clearTimeout(timer);
    }
    timersRef.current.clear();
    for (const [questionId, answer] of [...pendingRef.current.entries()]) {
      await persistAnswer(questionId, answer);
    }
  }

  async function finishAttempt(auto: boolean) {
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      try {
        await flushPending();
      } catch (cause) {
        const text = cause instanceof ApiError ? cause.message : '';
        const terminal =
          auto || text.includes('时间已到') || text.includes('已交卷');
        if (!terminal) {
          throw cause;
        }
      }
      const result = await submitAttempt(attemptId);
      messageApi.success(auto ? '考试时间已到，已自动交卷' : '交卷成功');
      navigate(`/exam-center/result/${result.attemptId}`, { replace: true });
    } catch (cause) {
      messageApi.error(cause instanceof ApiError ? cause.message : '交卷失败，请重试');
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  useEffect(() => {
    finishRef.current = (auto: boolean) => {
      void finishAttempt(auto);
    };
  });

  const handleSubmitClick = () => {
    const unanswered = questions.length - answeredCount;
    Modal.confirm({
      title: '确认交卷？',
      content:
        unanswered > 0
          ? `还有 ${unanswered} 道题未作答，交卷后不可修改。`
          : '交卷后不可修改，确认提交吗？',
      okText: '交卷',
      cancelText: '继续作答',
      onOk: () => finishAttempt(false),
    });
  };

  const handleJump = (index: number) => {
    setCurrentIndex(index);
    setPaletteOpen(false);
  };

  const renderInput = (question: AttemptQuestion) => {
    const answer = answers[question.paperQuestionId] ?? emptyAnswer();
    const disabled = submitting || remainingMs === 0;
    if (question.questionType === 4) {
      return (
        <Input.TextArea
          value={answer.text}
          disabled={disabled}
          autoSize={{ minRows: 6, maxRows: 14 }}
          maxLength={5000}
          showCount
          placeholder="请输入你的答案"
          onChange={(event) =>
            updateAnswer(question.paperQuestionId, { optionKeys: [], text: event.target.value })
          }
          onBlur={() => {
            const pending = pendingRef.current.get(question.paperQuestionId);
            if (pending) {
              const timer = timersRef.current.get(question.paperQuestionId);
              if (timer) {
                clearTimeout(timer);
                timersRef.current.delete(question.paperQuestionId);
              }
              void persistAnswer(question.paperQuestionId, pending).catch(() => undefined);
            }
          }}
        />
      );
    }

    const renderOptionBody = (optionKey: string, content: string, imageUrl: string) => (
      <Flex gap={8} align="flex-start">
        <Typography.Text strong>{optionKey}.</Typography.Text>
        <Flex vertical gap={6} style={{ minWidth: 0 }}>
          <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>{content}</Typography.Text>
          {imageUrl ? (
            <Image src={imageUrl} width={160} preview={false} alt={`选项 ${optionKey}`} />
          ) : null}
        </Flex>
      </Flex>
    );

    if (question.questionType === 2) {
      return (
        <Checkbox.Group
          value={answer.optionKeys}
          disabled={disabled}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          onChange={(keys) =>
            updateAnswer(question.paperQuestionId, {
              optionKeys: keys as string[],
              text: '',
            })
          }
        >
          {question.options.map((option) => (
            <Checkbox key={option.optionKey} value={option.optionKey}>
              {renderOptionBody(option.optionKey, option.content, option.imageUrl)}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );
    }

    return (
      <Radio.Group
        value={answer.optionKeys[0]}
        disabled={disabled}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        onChange={(event) =>
          updateAnswer(question.paperQuestionId, {
            optionKeys: [event.target.value as string],
            text: '',
          })
        }
      >
        {question.options.map((option) => (
          <Radio key={option.optionKey} value={option.optionKey}>
            {renderOptionBody(option.optionKey, option.content, option.imageUrl)}
          </Radio>
        ))}
      </Radio.Group>
    );
  };

  const renderPalette = () => (
    <Flex vertical gap={12}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Text strong>作答进度</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          已作答 {answeredCount} / {questions.length}
        </Typography.Text>
      </Flex>
      <Flex
        wrap
        gap={8}
        style={{
          alignContent: 'flex-start',
          maxHeight: isWide ? 'calc(100dvh - 300px)' : undefined,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        {questions.map((question, index) => {
          const answered = !answerIsEmpty(answers[question.paperQuestionId]);
          const current = index === currentIndex;
          return (
            <Button
              key={question.paperQuestionId}
              size="small"
              type={answered ? 'primary' : 'default'}
              style={{
                width: 36,
                height: 36,
                padding: 0,
                borderColor: current ? token.colorPrimary : undefined,
                boxShadow: current ? `0 0 0 2px ${token.colorPrimaryBorder}` : undefined,
              }}
              onClick={() => handleJump(index)}
            >
              {question.sort}
            </Button>
          );
        })}
      </Flex>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        蓝色表示已作答，描边表示当前题。
      </Typography.Text>
    </Flex>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: token.colorBgLayout, padding: 24 }}>
        <Card style={{ maxWidth: 960, margin: '80px auto' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  if (loadError || !paper) {
    return (
      <div style={{ minHeight: '100dvh', background: token.colorBgLayout, padding: 24 }}>
        <Card style={{ maxWidth: 720, margin: '80px auto' }}>
          <Result
            status="error"
            title="无法打开考试"
            subTitle={loadError ?? '考试数据不存在'}
            extra={[
              <Button
                key="retry"
                type="primary"
                onClick={() => {
                  setLoading(true);
                  setLoadError(null);
                  setReloadToken((value) => value + 1);
                }}
              >
                重试
              </Button>,
              <Button key="back" onClick={() => navigate('/exam-center')}>
                返回考试中心
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      {messageHolder}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Flex
          vertical={!isWide}
          justify="space-between"
          align={isWide ? 'center' : 'stretch'}
          gap={isWide ? 24 : 10}
          style={{
            maxWidth: CONTENT_MAX_WIDTH,
            margin: '0 auto',
            padding: isWide ? '14px 28px' : '12px 16px',
          }}
        >
          <Flex align="center" gap={12} style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: token.colorPrimaryBg,
                color: token.colorPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              iL
            </div>
            <Flex vertical gap={2} style={{ minWidth: 0 }}>
              <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                <Typography.Text
                  strong
                  ellipsis={{ tooltip: paper.examTitle }}
                  style={{ fontSize: isWide ? 16 : 15, minWidth: 0 }}
                >
                  {paper.examTitle}
                </Typography.Text>
                {isWide ? (
                  <Tag color="processing" style={{ marginInlineEnd: 0 }}>
                    考试中
                  </Tag>
                ) : null}
              </Flex>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                第 {paper.attemptNo} 次 · {formatDurationMinutes(paper.durationMinutes)} · 及格{' '}
                {formatScore(paper.passingScore)} / {formatScore(paper.totalScore)} 分
              </Typography.Text>
            </Flex>
          </Flex>

          <Flex
            align="center"
            justify={isWide ? 'flex-end' : 'space-between'}
            gap={isWide ? 24 : 8}
            wrap
          >
            <Flex vertical gap={0} align={isWide ? 'flex-end' : 'flex-start'}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                剩余时间
              </Typography.Text>
              <Typography.Text
                strong
                style={{
                  fontSize: isWide ? 22 : 18,
                  lineHeight: 1.2,
                  fontVariantNumeric: 'tabular-nums',
                  color:
                    remainingMs != null && remainingMs <= 5 * 60 * 1000
                      ? token.colorError
                      : token.colorText,
                }}
              >
                {remainingMs == null ? '不限时' : formatClock(remainingMs)}
              </Typography.Text>
            </Flex>
            <Flex vertical gap={0} align={isWide ? 'flex-end' : 'flex-start'}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                已作答
              </Typography.Text>
              <Typography.Text strong style={{ fontSize: 16 }}>
                {answeredCount} / {questions.length}
              </Typography.Text>
            </Flex>
            {!isWide ? <Button onClick={() => setPaletteOpen(true)}>题目</Button> : null}
            <Button type="primary" danger loading={submitting} onClick={handleSubmitClick}>
              交卷
            </Button>
          </Flex>
        </Flex>
      </header>

      <main
        style={{
          maxWidth: CONTENT_MAX_WIDTH,
          margin: '0 auto',
          padding: isWide ? '24px 28px 48px' : '16px 12px 32px',
        }}
      >
        <Flex gap={24} align="flex-start" vertical={!isWide}>
          {isWide ? (
            <aside
              aria-label="答题卡"
              style={{ width: 288, flexShrink: 0, position: 'sticky', top: 88 }}
            >
              <Card title="答题卡" size="small" styles={{ body: { padding: 16 } }}>
                {renderPalette()}
              </Card>
            </aside>
          ) : null}
          <Card
            style={{ flex: 1, minWidth: 0, width: isWide ? undefined : '100%' }}
            styles={{ body: { padding: isWide ? 32 : 18 } }}
          >
            {currentQuestion ? (
              <Flex
                vertical
                gap={20}
                style={{ maxWidth: 900, marginInline: 'auto', width: '100%' }}
              >
                <Flex justify="space-between" align="center" wrap gap={8}>
                  <Space size={8} wrap>
                    <Tag color="blue">第 {currentQuestion.sort} 题</Tag>
                    <Tag color={QUESTION_TYPE_META[currentQuestion.questionType].color}>
                      {QUESTION_TYPE_META[currentQuestion.questionType].label}
                    </Tag>
                    <Tag>{QUESTION_DIFFICULTY_META[currentQuestion.difficulty].label}</Tag>
                    <Typography.Text type="secondary">{currentQuestion.score} 分</Typography.Text>
                  </Space>
                  <SaveBadge state={saveStates[currentQuestion.paperQuestionId]} />
                </Flex>

                <Typography.Paragraph
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: 17,
                    lineHeight: 1.8,
                    marginBottom: 0,
                  }}
                >
                  {currentQuestion.content}
                </Typography.Paragraph>

                {currentQuestion.imageUrl ? (
                  <Image
                    src={currentQuestion.imageUrl}
                    width="100%"
                    style={{ maxWidth: 520 }}
                    alt="题目图片"
                  />
                ) : null}

                {renderInput(currentQuestion)}

                <Flex
                  justify="space-between"
                  align="center"
                  gap={12}
                  style={{
                    paddingTop: 16,
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                  >
                    上一题
                  </Button>
                  {currentIndex < questions.length - 1 ? (
                    <Button
                      type="primary"
                      onClick={() =>
                        setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))
                      }
                    >
                      下一题
                    </Button>
                  ) : (
                    <Button type="primary" danger loading={submitting} onClick={handleSubmitClick}>
                      交卷
                    </Button>
                  )}
                </Flex>
              </Flex>
            ) : (
              <Typography.Text type="secondary">本场考试暂无题目</Typography.Text>
            )}
          </Card>
        </Flex>
      </main>

      <Drawer
        open={paletteOpen}
        title="答题卡"
        placement="left"
        onClose={() => setPaletteOpen(false)}
        destroyOnHidden
      >
        <Flex vertical gap={16}>
          {renderPalette()}
          <Button type="primary" danger block loading={submitting} onClick={handleSubmitClick}>
            交卷
          </Button>
        </Flex>
      </Drawer>
    </div>
  );
}
