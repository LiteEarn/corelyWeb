export interface Evolution {
  id?: string;
  studioId: string;
  studentId: string;
  studentName?: string;
  objectiveId?: string;
  objectiveTitle?: string;
  evaluationId?: string;
  evolutionDate: string;
  title: string;
  description: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvolutionFilters {
  studentId?: string;
  objectiveId?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
}
