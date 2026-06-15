export interface AttendanceBulkRequest {
  studioId: string;
  classGroupId: string;
  attendanceDate: string;
  attendances: AttendanceItem[];
}

export interface AttendanceItem {
  studentId: string;
  present: boolean;
  observation?: string;
}
