// types/quiz.ts
export interface QuizData {
  problem: string;
  hints: string[];
  answer: string;
}

export interface ApiResponse {
  problem: string;
  hints: string[];
  answer: string;
  error?: string;
}