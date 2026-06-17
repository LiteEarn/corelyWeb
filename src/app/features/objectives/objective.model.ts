export interface Objective {
  id?: string;
  studioId?: string;
  studentId: string;
  title: string;
  description?: string;
  status: ObjectiveStatus;
  startDate: string;
  targetDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ObjectiveStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ObjectiveFilters {
  search?: string;
  studentId?: string;
  status?: ObjectiveStatus;
}
