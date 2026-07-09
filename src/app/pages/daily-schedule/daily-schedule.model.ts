export interface DailyScheduleResponse {
  kpis: DailyKpis;
  sessions: DailySessionItem[];
}

export interface DailyKpis {
  totalToday: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface DailySessionItem {
  id: string;
  classGroupId: string;
  classGroupName: string;
  instructorId: string;
  instructorName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  capacity: number;
  enrolledCount: number;
  presentCount: number;
  notes?: string;
}

export interface DailyScheduleFilters extends Record<string, string | undefined> {
  studioId: string;
  date?: string;
  instructorId?: string;
  status?: string;
  classGroupId?: string;
}
