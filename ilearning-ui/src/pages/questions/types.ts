import type { QuestionDifficulty, QuestionType } from '@/types/question';

export interface QuestionFilters {
  questionType?: QuestionType;
  difficulty?: QuestionDifficulty;
  questionBankId?: number;
  keyword?: string;
}
