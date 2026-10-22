import type { ExamListItem, ExamStatus } from '@/types/exam';

export const EXAM_STATUS_META: Record<ExamStatus, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '已发布', color: 'green' },
  2: { label: '已关闭', color: 'orange' },
};

export const EXAM_STATUS_OPTIONS: Array<{ value: ExamStatus; label: string }> = [
  { value: 0, label: '草稿' },
  { value: 1, label: '已发布' },
  { value: 2, label: '已关闭' },
];

export function examPhase(
  exam: Pick<ExamListItem, 'status' | 'startTime' | 'endTime'>,
  now = Date.now(),
): { label: string; color: string } {
  if (exam.status === 0) {
    return { label: '草稿', color: 'default' };
  }
  if (exam.status === 2) {
    return { label: '已关闭', color: 'orange' };
  }
  const start = exam.startTime ? new Date(exam.startTime).getTime() : null;
  const end = exam.endTime ? new Date(exam.endTime).getTime() : null;
  if (start != null && now < start) {
    return { label: '未开始', color: 'blue' };
  }
  if (end != null && now > end) {
    return { label: '已结束', color: 'red' };
  }
  return { label: '进行中', color: 'green' };
}

export function formatDuration(minutes: number): string {
  return minutes > 0 ? `${minutes} 分钟` : '不限时';
}

export function formatAttempts(attempts: number): string {
  return attempts > 0 ? `${attempts} 次` : '不限次数';
}
