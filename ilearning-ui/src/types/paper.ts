import type { QuestionDifficulty, QuestionType } from './question';

/** 0=草稿 1=已发布 2=已归档 */
export type PaperStatus = 0 | 1 | 2;

export interface PaperListItem {
  id: number;
  title: string;
  description: string;
  totalScore: number;
  questionCount: number;
  status: PaperStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaperQuestionOption {
  id?: number | null;
  optionKey: string;
  content: string;
  imageUrl: string;
  isCorrect: 0 | 1;
}

export interface PaperQuestion {
  paperQuestionId: number;
  questionId: number;
  sort: number;
  score: number;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  imageUrl: string;
  analysis: string;
  options: PaperQuestionOption[];
  snapshot: boolean;
}

export interface PaperDetail {
  id: number;
  title: string;
  description: string;
  totalScore: number;
  status: PaperStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  questions: PaperQuestion[];
}

export interface PaperQuestionPayload {
  questionId: number;
  score: number;
}

export interface PaperSavePayload {
  title: string;
  description: string;
  questions: PaperQuestionPayload[];
}
