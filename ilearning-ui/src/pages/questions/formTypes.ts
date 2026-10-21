import type { QuestionDifficulty, QuestionType } from '@/types/question';

export interface OptionFormValue {
  content: string;
  imageUrl?: string;
}

export interface QuestionFormValues {
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  imageUrl?: string;
  analysis?: string;
  questionBankId?: number;
  options: OptionFormValue[];
  correctIndex?: number;
  correctIndexes?: number[];
}
