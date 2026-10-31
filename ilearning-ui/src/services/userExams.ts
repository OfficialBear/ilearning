import type {
  AnswerSavePayload,
  AttemptHistoryItem,
  AttemptPaper,
  AttemptResult,
  UserExamItem,
} from '@/types/attempt';
import type { PageResult } from '@/types/question';
import { http } from '@/utils/request';

export interface UserExamQuery {
  page: number;
  pageSize: number;
  keyword?: string;
}

export function fetchUserExams(
  params: UserExamQuery,
  signal?: AbortSignal,
): Promise<PageResult<UserExamItem>> {
  return http.get<PageResult<UserExamItem>>('/user/exams', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
    },
    signal,
  });
}

export function startAttempt(examId: number): Promise<AttemptPaper> {
  return http.post<AttemptPaper>(`/user/exams/${examId}/attempts`);
}

export function fetchAttemptPaper(
  attemptId: number,
  signal?: AbortSignal,
): Promise<AttemptPaper> {
  return http.get<AttemptPaper>(`/user/attempts/${attemptId}`, { signal });
}

export function saveAttemptAnswer(
  attemptId: number,
  payload: AnswerSavePayload,
): Promise<void> {
  return http.put<void>(`/user/attempts/${attemptId}/answers`, payload);
}

export function submitAttempt(attemptId: number): Promise<AttemptResult> {
  return http.post<AttemptResult>(`/user/attempts/${attemptId}/submit`);
}

export function fetchAttemptResult(
  attemptId: number,
  signal?: AbortSignal,
): Promise<AttemptResult> {
  return http.get<AttemptResult>(`/user/attempts/${attemptId}/result`, { signal });
}

export function fetchAttemptHistory(
  params: { page: number; pageSize: number },
  signal?: AbortSignal,
): Promise<PageResult<AttemptHistoryItem>> {
  return http.get<PageResult<AttemptHistoryItem>>('/user/attempts', {
    query: { page: params.page, pageSize: params.pageSize },
    signal,
  });
}
