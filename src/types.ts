export type RiskLevel = 1 | 2 | 3 | 4 | 5;
export type AnswerValue = 1 | 2 | 3 | 4;

export interface Question {
  id: number;
  screen: 1 | 2 | 3 | 4 | 5;
  text: string;
  answers: Array<{ label: string; value: AnswerValue }>;
}

export type Answers = Record<number, AnswerValue | undefined>;

export interface Allocation {
  name: string;
  percentage: number;
  color: string;
}

export interface AllocationSet {
  debt: Allocation;
  equity: Allocation;
  alternative: Allocation;
}

export interface RiskProfile {
  level: RiskLevel;
  thaiName: string;
  scoreRange: string;
  allocations: AllocationSet;
  recommendation: string;
  color: string;
}
