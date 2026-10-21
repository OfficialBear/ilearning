import type {
  PageResult,
  QuestionDetail,
  QuestionDifficulty,
  QuestionListItem,
  QuestionSavePayload,
  QuestionType,
} from '@/types/question';
import { http } from '@/utils/request';

export interface QuestionQuery {
  page: number;
  pageSize: number;
  questionType?: QuestionType;
  difficulty?: QuestionDifficulty;
  questionBankId?: number;
  keyword?: string;
}

export function fetchQuestions(
  params: QuestionQuery,
  signal?: AbortSignal,
): Promise<PageResult<QuestionListItem>> {
  return http.get<PageResult<QuestionListItem>>('/questions', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      questionType: params.questionType,
      difficulty: params.difficulty,
      questionBankId: params.questionBankId,
      keyword: params.keyword,
    },
    signal,
  });
}

export function fetchQuestionDetail(
  id: number,
  signal?: AbortSignal,
): Promise<QuestionDetail> {
  return http.get<QuestionDetail>(`/questions/${id}`, { signal });
}

export function createQuestion(payload: QuestionSavePayload): Promise<number> {
  return http.post<number>('/questions', payload);
}

export function updateQuestion(id: number, payload: QuestionSavePayload): Promise<void> {
  return http.put<void>(`/questions/${id}`, payload);
}

export function deleteQuestion(id: number): Promise<void> {
  return http.delete<void>(`/questions/${id}`);
}

export function copyQuestion(id: number): Promise<number> {
  return http.post<number>(`/questions/${id}/copy`);
}
