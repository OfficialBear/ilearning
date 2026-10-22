import type { PaperStatus } from '@/types/paper';

export const PAPER_STATUS_META: Record<PaperStatus, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '已发布', color: 'green' },
  2: { label: '已归档', color: 'orange' },
};

export const PAPER_STATUS_OPTIONS: Array<{ value: PaperStatus; label: string }> = [
  { value: 0, label: '草稿' },
  { value: 1, label: '已发布' },
  { value: 2, label: '已归档' },
];

/** 去掉无意义的小数尾零，例如 10.00 -> 10、10.50 -> 10.5。 */
export function formatScore(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) {
    return '0';
  }
  return Number(value).toFixed(2).replace(/\.?0+$/, '');
}
