export interface DashboardOperationalResponse {
  summary: DashboardSummary;
  averageOccupancy: number;
  todayAttendanceRate: number;
  upcomingSessions: UpcomingSession[];
  pendingMakeupRequests: PendingMakeupRequest[];
  classOccupancy: ClassOccupancy[];
  alerts: DashboardAlert[];
}

export interface DashboardSummary {
  kpis: DashboardKpis;
}

export interface DashboardKpis {
  classesToday: number;
  classesInProgress: number;
  activeStudents: number;
  studentsPresentToday: number;
  pendingMakeups: number;
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
