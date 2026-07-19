export interface Booking {
  id?: string;
  studioId: string;
  studentId: string;
  studentName?: string;
  instructorId: string;
  instructorName?: string;
  roomId?: number;
  classType: string;
  startDateTime: string;
  endDateTime: string;
  status: BookingStatus;
  capacity?: number;
  makeUpClass: boolean;
  originalBookingId?: string;
  cancellationReason?: string;
  cancellationNotes?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface BookingFilters {
  studioId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TimeBlock {
  id?: string;
  studioId: string;
  instructorId?: number;
  roomId?: number;
  blockType: BlockType;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BlockType = 'INSTRUCTOR_VACATION' | 'ROOM_MAINTENANCE' | 'HOLIDAY' | 'ADMINISTRATIVE';

export interface AvailabilityResponse {
  startDateTime: string;
  endDateTime: string;
  available: boolean;
  reason?: string;
}

export interface ConflictResponse {
  type: string;
  description: string;
  conflictingBookingId: string;
}

export interface DashboardBookingMetrics {
  todayClasses: number;
  weekClasses: number;
  occupancyRate: number;
  noShowRate: number;
  cancellationRate: number;
}
