export interface Session {
  id?: string;
  studioId: string;
  instructorId: string;
  title: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionFilters {
  search?: string;
  status?: string;
  instructorId?: string;
  classGroupId?: string;
  sessionDate?: string;
}
