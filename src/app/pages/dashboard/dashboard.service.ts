import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SessionService } from '../../features/sessions/session.service';
import { MakeupRequestService } from '../../features/makeup-requests/makeup-request.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { AttendanceService } from '../../features/attendance/attendance.service';
import {
  OperationalDashboard,
  UpcomingSession,
  PendingMakeupRequest,
  ClassOccupancy,
  DashboardAlert,
} from './dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private sessionService: SessionService,
    private makeupRequestService: MakeupRequestService,
    private classGroupService: ClassGroupService,
    private enrollmentService: EnrollmentService,
    private instructorService: InstructorService,
    private attendanceService: AttendanceService,
  ) {}

  getOperationalDashboard(): Observable<OperationalDashboard> {
    const today = this.getTodayString();

    return forkJoin({
      sessions: this.sessionService.getAll({ sessionDate: today }).pipe(catchError(() => of([]))),
      pendingMakeups: this.makeupRequestService.getAll({ status: 'REQUESTED' }).pipe(catchError(() => of([]))),
      classGroups: this.classGroupService.getAll({ active: true }).pipe(catchError(() => of([]))),
      enrollments: this.enrollmentService.getAll({ active: true }).pipe(catchError(() => of([]))),
      instructors: this.instructorService.getAll({ active: true }).pipe(catchError(() => of([]))),
      attendance: this.attendanceService.getAll({ attendanceDate: today }).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ sessions, pendingMakeups, classGroups, enrollments, instructors, attendance }) => {
        const instructorMap = new Map<string, string>();
        for (const inst of instructors) {
          if (inst.id) {
            instructorMap.set(inst.id, inst.fullName);
          }
        }

        const classGroupByName = new Map<string, string>();
        for (const cg of classGroups) {
          if (cg.id) {
            classGroupByName.set(cg.name.toLowerCase(), cg.id);
          }
        }

        const enrollmentCountMap = new Map<string, number>();
        for (const e of enrollments) {
          if (e.classGroupId) {
            enrollmentCountMap.set(e.classGroupId, (enrollmentCountMap.get(e.classGroupId) || 0) + 1);
          }
        }

        const sortedSessions = [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));

        const upcomingSessions: UpcomingSession[] = sortedSessions.map((s) => {
          const cgId = classGroupByName.get(s.title.toLowerCase());
          const enrolled = cgId ? enrollmentCountMap.get(cgId) || 0 : 0;
          return {
            id: s.id || '',
            startTime: s.startTime,
            endTime: s.endTime,
            className: s.title,
            instructorName: instructorMap.get(s.instructorId) || '—',
            enrolledCount: enrolled,
            capacity: s.maxStudents,
            status: s.status,
          };
        });

        const pendingMakeupRequests: PendingMakeupRequest[] = pendingMakeups.map((m) => ({
          id: m.id || '',
          studentName: m.studentName || '—',
          className: m.className || '—',
          absenceDate: m.absenceDate,
        }));

        const classOccupancy: ClassOccupancy[] = classGroups.map((cg) => ({
          className: cg.name,
          enrolledCount: enrollmentCountMap.get(cg.id || '') || 0,
          capacity: cg.capacity,
        }));

        const todayClasses = sessions.length;
        const ongoingClasses = sessions.filter((s) => s.status === 'IN_PROGRESS').length;
        const presentStudents = attendance.filter((a) => a.present).length;
        const pendingMakeupsCount = pendingMakeups.length;

        const alerts: DashboardAlert[] = [];
        for (const cg of classGroups) {
          const count = enrollmentCountMap.get(cg.id || '') || 0;
          if (count >= cg.capacity) {
            alerts.push({
              type: 'full_class',
              message: `Turma "${cg.name}" lotada (${count}/${cg.capacity})`,
            });
          }
        }
        if (pendingMakeupsCount > 0) {
          alerts.push({
            type: 'pending_makeup',
            message: `${pendingMakeupsCount} reposição(ões) pendente(s) de aprovação`,
          });
        }
        if (ongoingClasses > 0) {
          alerts.push({
            type: 'ongoing_class',
            message: `${ongoingClasses} aula(s) em andamento agora`,
          });
        }

        return {
          todayClasses,
          ongoingClasses,
          presentStudents,
          pendingMakeups: pendingMakeupsCount,
          upcomingSessions,
          pendingMakeupRequests,
          classOccupancy,
          alerts,
        };
      }),
    );
  }

  private getTodayString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
