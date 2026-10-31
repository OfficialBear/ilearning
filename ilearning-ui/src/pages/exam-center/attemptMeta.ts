import type { AttemptHistoryItem, AttemptResult, AttemptStatus } from '@/types/attempt';

export const ATTEMPT_STATUS_META: Record<AttemptStatus, { label: string; color: string }> = {
  1: { label: '进行中', color: 'blue' },
  2: { label: '待人工评分', color: 'orange' },
  3: { label: '已判分', color: 'green' },
  4: { label: '已取消', color: 'default' },
};

export function attemptOutcome(
  item: Pick<AttemptHistoryItem, 'status' | 'isPassed'>,
): { label: string; color: string } {
  if (item.status === 1) {
    return { label: '进行中', color: 'blue' };
  }
  if (item.status === 2) {
    return { label: '待人工评分', color: 'orange' };
  }
  if (item.status === 4) {
    return { label: '已取消', color: 'default' };
  }
  return item.isPassed
    ? { label: '已通过', color: 'green' }
    : { label: '未通过', color: 'red' };
}

export function resultOutcome(result: AttemptResult): { label: string; color: string } {
  if (result.pendingManualGrading) {
    return { label: '待人工评分', color: 'orange' };
  }
  return result.isPassed
    ? { label: '已通过', color: 'green' }
    : { label: '未通过', color: 'red' };
}

export function formatSeconds(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) {
    return '-';
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) {
    return `${rest} 秒`;
  }
  return rest === 0 ? `${minutes} 分钟` : `${minutes} 分 ${rest} 秒`;
}

export function formatAttemptLimit(used: number, max: number): string {
  return max > 0 ? `${used} / ${max} 次` : `${used} 次（不限）`;
}

export function formatDurationMinutes(minutes: number): string {
  return minutes > 0 ? `${minutes} 分钟` : '不限时';
}

export function formatMaxAttempts(max: number): string {
  return max > 0 ? `${max} 次` : '不限次数';
}
