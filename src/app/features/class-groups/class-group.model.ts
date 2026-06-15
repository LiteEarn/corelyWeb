export interface ClassGroup {
  id?: string;
  studioId: string;
  instructorId: string;
  instructorName?: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  capacity: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassGroupFilters {
  search?: string;
  instructorId?: string;
  active?: boolean;
}
