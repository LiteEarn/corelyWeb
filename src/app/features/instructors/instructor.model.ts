export interface Instructor {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  specialty: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstructorFilters {
  search?: string;
  active?: boolean;
  specialty?: string;
}
