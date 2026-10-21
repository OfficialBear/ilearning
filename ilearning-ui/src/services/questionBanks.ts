import type {
  BankBrief,
  BankStatus,
  PageResult,
  QuestionBankListItem,
  QuestionBankSavePayload,
} from '@/types/question';
import { http } from '@/utils/request';

export interface QuestionBankQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: BankStatus;
}

export function fetchQuestionBanks(
  params: QuestionBankQuery,
  signal?: AbortSignal,
): Promise<PageResult<QuestionBankListItem>> {
  return http.get<PageResult<QuestionBankListItem>>('/question-banks', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      status: params.status,
    },
    signal,
  });
}

export function createQuestionBank(payload: QuestionBankSavePayload): Promise<number> {
  return http.post<number>('/question-banks', payload);
}

export function updateQuestionBank(
  id: number,
  payload: QuestionBankSavePayload,
): Promise<void> {
  return http.put<void>(`/question-banks/${id}`, payload);
}

export function updateQuestionBankStatus(id: number, status: BankStatus): Promise<void> {
  return http.put<void>(`/question-banks/${id}/status`, { status });
}

export function deleteQuestionBank(id: number): Promise<void> {
  return http.delete<void>(`/question-banks/${id}`);
}

export function fetchAvailableBanks(signal?: AbortSignal): Promise<BankBrief[]> {
  return http.get<BankBrief[]>('/question-banks/available', { signal });
}
