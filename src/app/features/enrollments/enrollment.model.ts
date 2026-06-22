export interface Enrollment {
  id?: string;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  studentEmail?: string;
  studentActive?: boolean;
  classGroupId: string;
  classGroupName?: string;
  enrollmentDate: string;
  status: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollmentFilters {
  studentId?: string;
  classGroupId?: string;
  status?: string;
  active?: boolean;
}
