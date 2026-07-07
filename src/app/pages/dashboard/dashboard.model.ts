export interface DashboardOperationalResponse {
  summary: DashboardSummary;
  upcomingSessions: UpcomingSession[];
  pendingMakeupRequests: PendingMakeupRequest[];
  classOccupancy: ClassOccupancy[];
  alerts: DashboardAlert[];
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  averageOccupancy: number;
  todayAttendanceRate: number;
}

export interface DashboardKpis {
  classesToday: number;
  classesInProgress: number;
  activeStudents: number;
  studentsPresentToday: number;
  pendingMakeups: number;
  averageOccupancy: number;
  todayAttendanceRate: number;
}

export interface UpcomingSession {
  id: string;
  classGroupId: string;
  className: string;
  instructorId: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  enrolledStudents: number;
  status: string;
}

export interface PendingMakeupRequest {
  id: string;
  classGroupId: string;
  studentName: string;
  className: string;
  absenceDate: string;
  reason: string;
}

export interface ClassOccupancy {
  classGroupId: string;
  className: string;
  capacity: number;
  enrolled: number;
  occupancyPercent: number;
}

export interface DashboardAlert {
  title: string;
  message: string;
  severity: string;
  type: string;
  actionLabel: string;
  actionRoute: string;
  actionId: string | null;
}
