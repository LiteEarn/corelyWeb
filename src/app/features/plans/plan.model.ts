export enum PlanType {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  PACKAGE = 'PACKAGE'
}

export const PlanTypeLabels: Record<PlanType, string> = {
  [PlanType.MONTHLY]: 'Mensal',
  [PlanType.WEEKLY]: 'Semanal',
  [PlanType.PACKAGE]: 'Pacote de Aulas'
};

export interface Plan {
  id?: string;
  studioId: string;
  name: string;
  description?: string;
  type: PlanType;
  value: number;
  quantityAulas?: number;
  duration: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanEnrollment {
  id?: string;
  studioId: string;
  studentId: string;
  studentName?: string;
  planId: string;
  planName?: string;
  planValue?: number;
  startDate: string;
  endDate?: string;
  status: PlanEnrollmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export enum PlanEnrollmentStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export const PlanEnrollmentStatusLabels: Record<PlanEnrollmentStatus, string> = {
  [PlanEnrollmentStatus.ACTIVE]: 'Ativo',
  [PlanEnrollmentStatus.CANCELLED]: 'Cancelado',
  [PlanEnrollmentStatus.COMPLETED]: 'Concluído'
};

export interface StudentPlanResponse {
  id: string;
  planId: string;
  planName: string;
  planType: string;
  planValue: number;
  startDate: string;
  endDate?: string;
  status: PlanEnrollmentStatus;
  createdAt: string;
}
