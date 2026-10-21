import type { QuestionDifficulty, QuestionType } from '@/types/question';

export const QUESTION_TYPE_META: Record<QuestionType, { label: string; color: string }> = {
  1: { label: '单选', color: 'blue' },
  2: { label: '多选', color: 'purple' },
  3: { label: '判断', color: 'green' },
  4: { label: '简答', color: 'orange' },
};

export const QUESTION_DIFFICULTY_META: Record<
  QuestionDifficulty,
  { label: string; color: string }
> = {
  1: { label: '简单', color: 'default' },
  2: { label: '中等', color: 'blue' },
  3: { label: '困难', color: 'red' },
};

export const QUESTION_TYPE_OPTIONS: Array<{ value: QuestionType; label: string }> = [
  { value: 1, label: '单选' },
  { value: 2, label: '多选' },
  { value: 3, label: '判断' },
  { value: 4, label: '简答' },
];

export const QUESTION_DIFFICULTY_OPTIONS: Array<{ value: QuestionDifficulty; label: string }> = [
  { value: 1, label: '简单' },
  { value: 2, label: '中等' },
  { value: 3, label: '困难' },
];

export function optionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const IMAGE_FALLBACK =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120">' +
      '<rect width="100%" height="100%" fill="#f5f5f5"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14">图片加载失败</text>' +
      '</svg>',
  );
