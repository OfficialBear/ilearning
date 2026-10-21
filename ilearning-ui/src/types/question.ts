export type QuestionType = 1 | 2 | 3 | 4;

export type QuestionDifficulty = 1 | 2 | 3;

export interface PageResult<T> {
  total: number;
  records: T[];
}

export interface BankBrief {
  id: number;
  title: string;
}

export interface QuestionListItem {
  id: number;
  questionBankId: number;
  questionBank: BankBrief | null;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id?: number;
  optionKey: string;
  content: string;
  imageUrl: string;
  isCorrect: 0 | 1;
}

export interface QuestionDetail extends QuestionListItem {
  analysis: string;
  paperReferenceCount: number;
  options: QuestionOption[];
}

export interface QuestionOptionPayload {
  content: string;
  imageUrl: string;
  isCorrect: 0 | 1;
}

export interface QuestionSavePayload {
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  imageUrl: string;
  analysis: string;
  questionBankId: number;
  options: QuestionOptionPayload[];
}
