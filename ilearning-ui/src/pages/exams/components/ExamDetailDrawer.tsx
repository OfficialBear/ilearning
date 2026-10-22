import { Alert, Button, Descriptions, Drawer, Flex, Grid, Result, Skeleton, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { fetchExamDetail } from '@/services/exams';
import type { ExamDetail } from '@/types/exam';
import { formatDateTime, formatScore } from '@/utils/format';
import { ApiError } from '@/utils/request';
import { examPhase, formatAttempts, formatDuration } from '../examMeta';

interface ExamDetailDrawerProps {
  open: boolean;
  examId: number | null;
  onClose: () => void;
}

function ExamDetailContent({ examId }: { examId: number }) {
  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchExamDetail(examId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetail(data);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof ApiError ? cause.message : '加载考试详情失败');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [examId, reloadToken]);

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

  const phase = examPhase(detail);

  return (
    <Flex vertical gap={16}>
      <Flex wrap gap={8} align="center">
        <Tag color={phase.color} style={{ marginInlineEnd: 0 }}>
          {phase.label}
        </Tag>
        <Typography.Text type="secondary">
          及格 {formatScore(detail.passingScore)} / {formatScore(detail.paperTotalScore)} 分
        </Typography.Text>
      </Flex>

      {detail.paperStatus !== 1 && detail.status === 0 ? (
        <Alert
          type="warning"
          showIcon
          message="关联试卷当前不可用"
          description="试卷已归档或未发布，发布本场考试前需要更换为已发布试卷。"
        />
      ) : null}

      <Descriptions
        column={1}
        size="small"
        bordered
        items={[
          { key: 'paper', label: '试卷', children: detail.paperTitle },
          {
            key: 'window',
            label: '开放时间',
            children: `${detail.startTime ? formatDateTime(detail.startTime) : '不限'} ~ ${
              detail.endTime ? formatDateTime(detail.endTime) : '不限'
            }`,
          },
          { key: 'duration', label: '单次时长', children: formatDuration(detail.durationMinutes) },
          { key: 'attempts', label: '参加次数', children: formatAttempts(detail.maxAttempts) },
          {
            key: 'passing',
            label: '及格线',
            children: `${formatScore(detail.passingScore)} 分`,
          },
          {
            key: 'description',
            label: '考试说明',
            children: detail.description || '暂无说明',
          },
          { key: 'created', label: '创建时间', children: formatDateTime(detail.createdAt) },
          { key: 'updated', label: '更新时间', children: formatDateTime(detail.updatedAt) },
        ]}
      />
    </Flex>
  );
}

export default function ExamDetailDrawer({ open, examId, onClose }: ExamDetailDrawerProps) {
  const screens = Grid.useBreakpoint();
  return (
    <Drawer
      open={open}
      size={screens.sm ? 640 : 'default'}
      title="考试详情"
      onClose={onClose}
      destroyOnHidden
    >
      {open && examId != null ? <ExamDetailContent examId={examId} /> : null}
    </Drawer>
  );
}
