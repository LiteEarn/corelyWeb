export interface Enrollment {
  id?: string;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  studentEmail?: string;
  classGroupId: string;
  classGroupName?: string;
  enrollmentDate: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollmentFilters {
  studentId?: string;
  classGroupId?: string;
  status?: string;
}
