import type { BankStatus, QuestionType } from '@/types/question';

export const BANK_STATUS_META: Record<BankStatus, { label: string; color: string }> = {
  0: { label: '停用', color: 'default' },
  1: { label: '启用', color: 'green' },
};

export const BANK_STATUS_OPTIONS: Array<{ value: BankStatus; label: string }> = [
  { value: 1, label: '启用' },
  { value: 0, label: '停用' },
];

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  1: '单选',
  2: '多选',
  3: '判断',
  4: '简答',
};
