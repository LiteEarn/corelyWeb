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

export interface AttendanceFilters {
  classGroupId?: string;
  attendanceDate?: string;
}
