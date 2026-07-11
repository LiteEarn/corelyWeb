export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED';

export interface Attendance {
  id?: string;
  studioId: string;
  classGroupId: string;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  attendanceDate: string;
  present: boolean;
  observation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionAttendance {
  id?: string;
  studentId?: string;
  enrollmentId?: string;
  studentName?: string;
  status: AttendanceStatus;
  classSessionId: string;
  attendanceDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceFilters {
  classGroupId?: string;
  attendanceDate?: string;
}

export interface AttendanceRequest {
  studentId: string;
  status: AttendanceStatus;
}

export interface SessionBulkAttendanceItem {
  enrollmentId: string;
  status: AttendanceStatus;
}

export interface SessionBulkAttendanceRequest {
  attendances: SessionBulkAttendanceItem[];
}
