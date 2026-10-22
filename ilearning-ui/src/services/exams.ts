import type { ExamDetail, ExamListItem, ExamSavePayload, ExamStatus } from '@/types/exam';
import type { PageResult } from '@/types/question';
import { http } from '@/utils/request';

export interface ExamQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: ExamStatus;
  paperId?: number;
}

export function fetchExams(
  params: ExamQuery,
  signal?: AbortSignal,
): Promise<PageResult<ExamListItem>> {
  return http.get<PageResult<ExamListItem>>('/exams', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      status: params.status,
      paperId: params.paperId,
    },
    signal,
  });
}

export function fetchExamDetail(id: number, signal?: AbortSignal): Promise<ExamDetail> {
  return http.get<ExamDetail>(`/exams/${id}`, { signal });
}

export function createExam(payload: ExamSavePayload): Promise<number> {
  return http.post<number>('/exams', payload);
}

export function updateExam(id: number, payload: ExamSavePayload): Promise<void> {
  return http.put<void>(`/exams/${id}`, payload);
}

export function publishExam(id: number): Promise<void> {
  return http.put<void>(`/exams/${id}/publish`);
}

export function closeExam(id: number): Promise<void> {
  return http.put<void>(`/exams/${id}/close`);
}

export function deleteExam(id: number): Promise<void> {
  return http.delete<void>(`/exams/${id}`);
}
