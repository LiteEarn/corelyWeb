export interface Student {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFilters {
  search?: string;
  active?: boolean;
}
