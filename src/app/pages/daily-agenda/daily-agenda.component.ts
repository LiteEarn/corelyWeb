import { Component, OnInit, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import {
  DsPageHeaderComponent,
  DsEmptyStateComponent,
} from '../../shared/design-system';
import { DsStatusChipComponent, ChipStatus } from '../../shared/design-system/status-chip/status-chip.component';
import { DsButtonComponent } from '../../shared/design-system/button/button.component';
import { LoadingComponent } from '../../shared/components';
import { SessionService } from '../../features/sessions/session.service';
import { Session } from '../../features/sessions/session.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { ToastService } from '../../core/services/toast.service';
import { AttendanceService } from '../../features/attendance/attendance.service';
import { AttendanceStatus } from '../../features/attendance/attendance.model';

interface SessionCard {
  session: Session;
  instructorName: string;
  classGroupId?: string;
  enrolledCount?: number;
  expanded: boolean;
  _students?: SessionStudent[];
}

interface SessionStudent {
  studentId: string;
  studentName: string;
  enrollmentStatus: string;
  attendanceStatus?: AttendanceStatus;
  saving?: boolean;
}

@Component({
  selector: 'app-daily-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent,
    DsStatusChipComponent,
    DsButtonComponent,
    LoadingComponent,
  ],
  templateUrl: './daily-agenda.component.html',
  styleUrl: './daily-agenda.component.scss',
})
export class DailyAgendaComponent implements OnInit, OnDestroy {
  sessionCards: SessionCard[] = [];
  filteredCards: SessionCard[] = [];
  instructors: Instructor[] = [];
  selectedDate: Date = new Date();
  instructorFilter: string = 'all';
  loading: boolean = false;
  error: string | null = null;
  sessionActionLoading: Record<string, 'start' | 'complete' | null> = {};

  private allSessions: Session[] = [];
  private classGroups: { id: string; name: string }[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private instructorService: InstructorService,
    private classGroupService: ClassGroupService,
    private enrollmentService: EnrollmentService,
    private toastService: ToastService,
    private attendanceService: AttendanceService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    this.loadInstructors();
    this.loadClassGroups();
    this.loadSessions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;

    const filters: { sessionDate: string; instructorId?: string } = {
      sessionDate: this.formatDate(this.selectedDate),
    };

    if (this.instructorFilter !== 'all') {
      filters.instructorId = this.instructorFilter;
    }

    this.sessionService.getAll(filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: (sessions) => {
        this.allSessions = sessions;
        this.buildSessionCards();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro ao carregar as aulas. Tente novamente.';
        this.toastService.error('Erro ao carregar as aulas. Tente novamente.');
      },
    });
  }

  private loadInstructors(): void {
    this.instructorService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.instructors = data;
      },
    });
  }

  private loadClassGroups(): void {
    this.classGroupService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.classGroups = data.map((cg) => ({ id: cg.id!, name: cg.name }));
      },
    });
  }

  private buildSessionCards(): void {
    const dateStr = this.formatDate(this.selectedDate);

    const daySessions = this.allSessions.filter((s) => s.scheduledDate === dateStr);

    this.sessionCards = daySessions.map((session) => {
      const instructor = this.instructors.find((i) => i.id === session.instructorId);
      const classGroup = this.classGroups.find(
        (cg) => cg.name.toLowerCase() === session.title.toLowerCase()
      );

      return {
        session,
        instructorName: instructor ? instructor.fullName : 'Não encontrado',
        classGroupId: classGroup?.id,
        enrolledCount: undefined,
        expanded: false,
      };
    });

    this.applyFilter();

    this.loadEnrolledCounts();
  }

  private loadEnrolledCounts(): void {
    for (const card of this.sessionCards) {
      if (card.classGroupId) {
        this.enrollmentService.getStudentsByClassGroupId(card.classGroupId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (enrollments) => {
            const activeEnrollments = enrollments.filter(
              (e) => e.studentActive !== false && e.active !== false
            );
            card.enrolledCount = activeEnrollments.length;
          },
          error: () => {
            this.toastService.error('Erro ao carregar a ocupação das turmas.');
          },
        });
      }
    }
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.collapseAll();
    this.loadSessions();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.collapseAll();
    this.loadSessions();
  }

  clearFilters(): void {
    this.instructorFilter = 'all';
    this.goToToday();
  }

  onInstructorFilterChange(value: string): void {
    this.instructorFilter = value;
    this.collapseAll();
    this.loadSessions();
  }

  private applyFilter(): void {
    this.filteredCards = this.sessionCards.filter((card) => {
      return (
        this.instructorFilter === 'all' ||
        card.session.instructorId === this.instructorFilter
      );
    });
  }

  toggleCard(card: SessionCard): void {
    if (card.expanded) {
      card.expanded = false;
      return;
    }

    this.collapseAll();
    card.expanded = true;

    if (card.classGroupId && !card._students) {
      this.loadStudentsForCard(card);
    }
  }

  private loadStudentsForCard(card: SessionCard): void {
    if (!card.classGroupId) return;

    this.enrollmentService.getStudentsByClassGroupId(card.classGroupId).pipe(
      switchMap((enrollments) => {
        const activeEnrollments = enrollments.filter(
          (e) => e.studentActive !== false && e.active !== false
        );

        const students = activeEnrollments.map((e) => ({
          studentId: e.studentId,
          studentName: e.studentName || '',
          enrollmentStatus: e.status,
        }));

        return this.enrollmentService.getAll({ classGroupId: card.classGroupId, active: true }).pipe(
          switchMap((allEnrollments) => {
            const existingIds = new Set(activeEnrollments.map((e) => e.studentId));
            const additional = allEnrollments.filter(
              (e) => !existingIds.has(e.studentId) && e.studentName
            );
            for (const a of additional) {
              students.push({
                studentId: a.studentId,
                studentName: a.studentName || '',
                enrollmentStatus: a.status,
              });
            }
            card._students = students;

            if (card.session.id) {
              return this.attendanceService.getBySessionId(card.session.id);
            }
            return of([]);
          }),
          catchError(() => {
            card._students = students;
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (attendances) => {
        if (attendances.length > 0) {
          const attMap = new Map(attendances.map((a) => [a.studentId, a.status]));
          for (const student of card._students || []) {
            student.attendanceStatus = attMap.get(student.studentId);
          }
        }
      },
      error: () => {
        card._students = [];
        this.toastService.error('Erro ao carregar os alunos da aula.');
      },
    });
  }

  setAttendance(student: SessionStudent, status: AttendanceStatus, card: SessionCard): void {
    if (student.saving || !card.session.id) return;

    if (student.attendanceStatus === status) return;

    student.saving = true;

    this.attendanceService.createAttendance(card.session.id, {
      studentId: student.studentId,
      status,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        student.attendanceStatus = status;
        student.saving = false;
        this.toastService.success('Presença registrada.');
      },
      error: () => {
        student.saving = false;
        this.toastService.error('Não foi possível registrar a presença.');
      },
    });
  }

  startSession(card: SessionCard): void {
    const sessionId = card.session.id;
    if (!sessionId || this.sessionActionLoading[sessionId]) return;

    this.sessionActionLoading[sessionId] = 'start';

    this.sessionService.start(sessionId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        card.session.status = updated.status;
        this.sessionActionLoading[sessionId] = null;
        this.toastService.success('Aula iniciada.');
      },
      error: () => {
        this.sessionActionLoading[sessionId] = null;
        this.toastService.error('Não foi possível iniciar a aula.');
      },
    });
  }

  completeSession(card: SessionCard): void {
    const sessionId = card.session.id;
    if (!sessionId || this.sessionActionLoading[sessionId]) return;

    this.sessionActionLoading[sessionId] = 'complete';

    this.sessionService.complete(sessionId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        card.session.status = updated.status;
        this.sessionActionLoading[sessionId] = null;
        this.toastService.success('Aula finalizada.');
      },
      error: () => {
        this.sessionActionLoading[sessionId] = null;
        this.toastService.error('Não foi possível finalizar a aula.');
      },
    });
  }

  getSessionStudents(card: SessionCard): SessionStudent[] {
    return card._students || [];
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  getStatusChip(status: string): { status: ChipStatus; label: string } {
    const map: Record<string, { status: ChipStatus; label: string }> = {
      SCHEDULED: { status: 'completed', label: 'Agendada' },
      IN_PROGRESS: { status: 'warning', label: 'Em andamento' },
      COMPLETED: { status: 'success', label: 'Concluída' },
      CANCELLED: { status: 'cancelled', label: 'Cancelada' },
    };
    return map[status.toUpperCase()] || { status: 'pending', label: status };
  }

  getOccupancyLabel(card: SessionCard): string {
    const enrolled = card.enrolledCount ?? 0;
    const capacity = card.session.maxStudents ?? 0;
    return `${enrolled}/${capacity} alunos`;
  }

  formatTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(): boolean {
    const today = new Date();
    return this.formatDate(this.selectedDate) === this.formatDate(today);
  }

  isPast(): boolean {
    const today = new Date();
    return this.selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  private collapseAll(): void {
    for (const card of this.sessionCards) {
      card.expanded = false;
    }
  }
}
