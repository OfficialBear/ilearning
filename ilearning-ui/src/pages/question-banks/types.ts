import type { BankStatus } from '@/types/question';

export interface QuestionBankFilters {
  keyword?: string;
  status?: BankStatus;
}
