import type {
  PaperDetail,
  PaperListItem,
  PaperSavePayload,
  PaperStatus,
} from '@/types/paper';
import type { PageResult } from '@/types/question';
import { http } from '@/utils/request';

export interface PaperQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: PaperStatus;
}

export function fetchPapers(
  params: PaperQuery,
  signal?: AbortSignal,
): Promise<PageResult<PaperListItem>> {
  return http.get<PageResult<PaperListItem>>('/papers', {
    query: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      status: params.status,
    },
    signal,
  });
}

export function fetchPaperDetail(id: number, signal?: AbortSignal): Promise<PaperDetail> {
  return http.get<PaperDetail>(`/papers/${id}`, { signal });
}

export function createPaper(payload: PaperSavePayload): Promise<number> {
  return http.post<number>('/papers', payload);
}

export function updatePaper(id: number, payload: PaperSavePayload): Promise<void> {
  return http.put<void>(`/papers/${id}`, payload);
}

export function publishPaper(id: number): Promise<void> {
  return http.put<void>(`/papers/${id}/publish`);
}

export function archivePaper(id: number): Promise<void> {
  return http.put<void>(`/papers/${id}/archive`);
}

export function deletePaper(id: number): Promise<void> {
  return http.delete<void>(`/papers/${id}`);
}
