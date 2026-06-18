export interface DashboardData {
  activeStudents?: number;
  activeInstructors?: number;
  activeClassGroups?: number;
  totalEnrollments?: number;
  attendanceThisWeek?: number;
  attendanceThisMonth?: number;
  activeObjectives?: number;
  completedObjectives?: number;
  occupancyRate?: number;
  recentEvaluations?: RecentEvaluation[];
  recentEvolutions?: RecentEvolution[];
}

export interface RecentEvaluation {
  studentId?: string;
  studentName?: string;
  date?: string;
  weight?: number;
  height?: number;
}

export interface RecentEvolution {
  studentId?: string;
  studentName?: string;
  date?: string;
  title?: string;
  description?: string;
}
