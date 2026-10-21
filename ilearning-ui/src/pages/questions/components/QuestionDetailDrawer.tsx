import { Button, Drawer, Result, Skeleton, Space } from 'antd';
import { useEffect, useState } from 'react';
import { fetchQuestionDetail } from '@/services/questions';
import type { QuestionDetail } from '@/types/question';
import { ApiError } from '@/utils/request';
import QuestionPreview from './QuestionPreview';

interface QuestionDetailDrawerProps {
  open: boolean;
  questionId: number | null;
  onClose: () => void;
  onEdit: (id: number) => void;
  onCopy: (id: number) => void;
}

interface QuestionDetailContentProps {
  questionId: number;
}

function QuestionDetailContent({ questionId }: QuestionDetailContentProps) {
  const [detail, setDetail] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestionDetail(questionId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetail(data);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof ApiError ? cause.message : '加载试题详情失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [questionId, reloadToken]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadToken((value) => value + 1);
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }
  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={
          <Button type="primary" onClick={retry}>
            重试
          </Button>
        }
      />
    );
  }
  if (!detail) {
    return null;
  }
  return <QuestionPreview question={detail} />;
}

export default function QuestionDetailDrawer({
  open,
  questionId,
  onClose,
  onEdit,
  onCopy,
}: QuestionDetailDrawerProps) {
  return (
    <Drawer
      open={open}
      size={860}
      title="题目预览"
      onClose={onClose}
      destroyOnHidden
      extra={
        <Space>
          <Button onClick={() => questionId != null && onCopy(questionId)}>复制为新题</Button>
          <Button
            type="primary"
            onClick={() => questionId != null && onEdit(questionId)}
          >
            编辑
          </Button>
        </Space>
      }
    >
      {open && questionId != null ? (
        <QuestionDetailContent key={questionId} questionId={questionId} />
      ) : null}
    </Drawer>
  );
}
