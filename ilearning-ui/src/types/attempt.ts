import type { QuestionDifficulty, QuestionType } from './question';

/** 1=进行中 2=已交卷待评分 3=已判分 4=已取消 */
export type AttemptStatus = 1 | 2 | 3 | 4;

export interface UserExamItem {
  id: number;
  title: string;
  description: string;
  paperTitle: string;
  totalScore: number;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  attemptsUsed: number;
  inProgressAttemptId: number | null;
  startTime: string | null;
  endTime: string | null;
  canStart: boolean;
  exhausted: boolean;
}

export interface AttemptOption {
  optionKey: string;
  content: string;
  imageUrl: string;
}

export interface AttemptQuestion {
  paperQuestionId: number;
  sort: number;
  score: number;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  imageUrl: string;
  options: AttemptOption[];
  selectedOptionKeys: string[];
  textAnswer: string | null;
}

export interface AttemptPaper {
  attemptId: number;
  examId: number;
  examTitle: string;
  examDescription: string;
  attemptNo: number;
  startedAt: string;
  deadline: string | null;
  deadlineMillis: number | null;
  serverTimeMillis: number;
  durationMinutes: number;
  totalScore: number;
  passingScore: number;
  questions: AttemptQuestion[];
}

export interface AttemptResultOption extends AttemptOption {
  isCorrect: 0 | 1;
}

export interface AttemptResultQuestion {
  paperQuestionId: number;
  sort: number;
  score: number;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  imageUrl: string;
  options: AttemptResultOption[];
  selectedOptionKeys: string[];
  textAnswer: string | null;
  isCorrect: boolean | null;
  actualScore: number | null;
  analysis: string;
}

export interface AttemptResult {
  attemptId: number;
  examId: number;
  examTitle: string;
  attemptNo: number;
  status: AttemptStatus;
  userScore: number | null;
  totalScore: number;
  passingScore: number;
  isPassed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  timeSpentSeconds: number | null;
  pendingManualGrading: boolean;
  questions: AttemptResultQuestion[];
}

export interface AttemptHistoryItem {
  id: number;
  examId: number;
  examTitle: string;
  attemptNo: number;
  status: AttemptStatus;
  userScore: number | null;
  totalScore: number;
  passingScore: number;
  isPassed: boolean | null;
  startedAt: string;
  deadline: string | null;
  submittedAt: string | null;
}

export interface AnswerSavePayload {
  paperQuestionId: number;
  optionKeys: string[];
  textAnswer: string | null;
}
