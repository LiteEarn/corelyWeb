import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan, PlanEnrollment, StudentPlanResponse } from './plan.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private planUrl = API_CONFIG.baseURL + '/plans';
  private enrollmentUrl = API_CONFIG.baseURL + '/plan-enrollments';

  constructor(private http: HttpClient) {}

  getPlans(activeOnly?: boolean): Observable<Plan[]> {
    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('active', 'true');
    }
    return this.http.get<Plan[]>(this.planUrl, { params });
  }

  getPlanById(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.planUrl}/${id}`);
  }

  createPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.planUrl, plan);
  }

  updatePlan(id: string, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.planUrl}/${id}`, plan);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.planUrl}/${id}`);
  }

  inactivatePlan(id: string): Observable<void> {
    return this.http.post<void>(`${this.planUrl}/${id}/inactivate`, {});
  }

  getEnrollments(): Observable<PlanEnrollment[]> {
    return this.http.get<PlanEnrollment[]>(this.enrollmentUrl);
  }

  getEnrollmentById(id: string): Observable<PlanEnrollment> {
    return this.http.get<PlanEnrollment>(`${this.enrollmentUrl}/${id}`);
  }

  createEnrollment(enrollment: PlanEnrollment): Observable<PlanEnrollment> {
    return this.http.post<PlanEnrollment>(this.enrollmentUrl, enrollment);
  }

  cancelEnrollment(id: string): Observable<PlanEnrollment> {
    return this.http.post<PlanEnrollment>(`${this.enrollmentUrl}/${id}/cancel`, {});
  }

  getStudentEnrollments(studentId: string): Observable<PlanEnrollment[]> {
    return this.http.get<PlanEnrollment[]>(`${this.enrollmentUrl}/student/${studentId}`);
  }
}
