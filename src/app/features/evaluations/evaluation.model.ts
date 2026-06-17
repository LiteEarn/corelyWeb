export interface Evaluation {
  id?: string;
  studioId: string;
  studentId: string;
  studentName?: string;
  evaluationDate: string;
  weight: number;
  height: number;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationFilters {
  studentId?: string;
  startDate?: string;
  endDate?: string;
}
