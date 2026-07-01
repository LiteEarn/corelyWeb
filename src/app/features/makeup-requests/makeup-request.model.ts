export type MakeupRequestStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'USED' | 'EXPIRED';

export interface MakeupRequest {
  id?: string;
  studentId: string;
  studentName?: string;
  classGroupId?: string;
  className?: string;
  instructorId?: string;
  instructorName?: string;
  absenceDate: string;
  reason: string;
  status: MakeupRequestStatus;
  rejectionReason?: string;
  approvedSessionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MakeupRequestFilters {
  status?: string;
  studentId?: string;
  instructorId?: string;
  absenceDate?: string;
}
