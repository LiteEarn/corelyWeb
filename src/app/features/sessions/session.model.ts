export type CancelReason = 'HOLIDAY' | 'MAINTENANCE' | 'INSTRUCTOR_ABSENT' | 'LOW_OCCUPANCY' | 'EVENT' | 'OTHER';

export interface Session {
  id?: string;
  studioId: string;
  instructorId: string;
  title: string;
  classGroupId: string;
  classGroupName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  status: string;
  cancelReason?: CancelReason;
  cancelDescription?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CancelSessionRequest {
  cancelReason: CancelReason;
  cancelDescription?: string;
}

export interface SessionFilters {
  search?: string;
  status?: string;
  instructorId?: string;
  classGroupId?: string;
  sessionDate?: string;
}
