import type { PaperStatus } from './paper';

/** 0=草稿 1=已发布 2=已关闭 */
export type ExamStatus = 0 | 1 | 2;

export interface ExamListItem {
  id: number;
  paperId: number;
  paperTitle: string;
  paperTotalScore: number;
  paperStatus: PaperStatus;
  title: string;
  description: string;
  durationMinutes: number;
  maxAttempts: number;
  passingScore: number;
  startTime: string | null;
  endTime: string | null;
  status: ExamStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export type ExamDetail = ExamListItem;

export interface ExamSavePayload {
  paperId: number;
  title: string;
  description: string;
  durationMinutes: number;
  maxAttempts: number;
  passingScore: number;
  startTime: string | null;
  endTime: string | null;
}
