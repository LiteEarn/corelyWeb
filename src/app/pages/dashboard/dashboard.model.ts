export interface DashboardOperationalResponse {
  todayClasses: number;
  ongoingClasses: number;
  presentStudents: number;
  pendingMakeups: number;
  upcomingSessions: UpcomingSession[];
  pendingMakeupRequests: PendingMakeupRequest[];
  classOccupancy: ClassOccupancy[];
  alerts: DashboardAlert[];
}

export interface UpcomingSession {
  id: string;
  startTime: string;
  endTime: string;
  className: string;
  instructorName: string;
  enrolledCount: number;
  capacity: number;
  status: string;
}

export interface PendingMakeupRequest {
  id: string;
  studentName: string;
  className: string;
  absenceDate: string;
}

export interface ClassOccupancy {
  classGroupId: string;
  className: string;
  capacity: number;
  enrolled: number;
  occupancyPercent: number;
}

export interface DashboardAlert {
  type: 'full_class' | 'pending_makeup' | 'ongoing_class';
  message: string;
}
