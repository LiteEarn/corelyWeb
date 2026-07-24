export interface ComercialBooking {
  id: string;
  classSessionId: string;
  studentId: string;
  studentName?: string;
  bookingDateTime: string;
  status: ComercialBookingStatus;
  active: boolean;
  cancelReason?: string;
  cancelDescription?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  classSessionDate: string;
  classSessionStartTime: string;
  classSessionEndTime: string;
  instructorId?: string;
  instructorName?: string;
  roomId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ComercialBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface ComercialBookingAgendaFilters {
  startDate: string;
  endDate: string;
  instructorId?: string;
  roomId?: number;
  studentId?: string;
}

export interface ComercialCancelBookingRequest {
  reason: ComercialCancelReason;
  description?: string;
}

export type ComercialCancelReason = 'STUDENT' | 'STUDIO' | 'INSTRUCTOR' | 'WEATHER' | 'OTHER' | 'SESSION_CANCELLED';

export interface ComercialConflictResponse {
  conflictType: 'INSTRUCTOR' | 'ROOM' | 'STUDENT';
  conflictingBookingId: string;
  description: string;
}

export interface ComercialAvailabilityResponse {
  classSessionId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableSpots: number;
  available: boolean;
  reason?: string;
}

export interface ComercialBookingDashboard {
  date: string;
  totalBookings: number;
  confirmed: number;
  cancelled: number;
  noShow: number;
  completed: number;
  totalCapacity: number;
  totalBooked: number;
  freeCapacity: number;
  occupancyRate: number;
}

export interface ComercialTimeBlock {
  id?: string;
  instructorId?: string;
  roomId?: number;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
  blockType: 'VACATION' | 'MAINTENANCE' | 'HOLIDAY' | 'ADMIN';
  active?: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
