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
import { MatTableModule } from '@angular/material/table';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
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
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

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
  enrollmentId?: string;
  studentName: string;
  studentPhone?: string;
  enrollmentStatus: string;
  attendanceStatus?: AttendanceStatus;
  _originalStatus?: AttendanceStatus;
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
    MatTableModule,
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
  sessionActionLoading: Record<string, boolean> = {};
  savingAttendance: { [key: string]: boolean } = {};
  studentColumns: string[] = ['name', 'phone', 'status', 'presence'];

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
    private featureGateService: FeatureGateService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    if (this.featureGateService.canLoadInstructors()) {
      this.loadInstructors();
    }
    if (this.featureGateService.canLoadClassGroups()) {
      this.loadClassGroups();
    }
    if (this.featureGateService.canLoadSessions()) {
      this.loadSessions();
    }
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

    this.sessionService.getAll(filters).pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (sessions) => {
        this.allSessions = sessions || [];
        this.buildSessionCards();
      },
      error: () => {
        this.error = 'Erro ao carregar as aulas. Tente novamente.';
        this.toastService.error('Erro ao carregar as aulas. Tente novamente.');
      },
    });
  }

  private loadInstructors(): void {
    this.instructorService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.instructors = data;
        this.buildSessionCards();
      },
    });
  }

  private loadClassGroups(): void {
    this.classGroupService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.classGroups = data.map((cg) => ({ id: cg.id!, name: cg.name }));
        this.buildSessionCards();
      },
    });
  }

  private buildSessionCards(): void {
    this.sessionCards = this.allSessions.map((session) => {
      const instructor = this.instructors.find((i) => i.id === session.instructorId);

      return {
        session,
        instructorName: instructor ? instructor.fullName : session.instructorId || 'Não encontrado',
        classGroupId: session.classGroupId,
        enrolledCount: undefined,
        expanded: false,
      };
    });

    this.applyFilter();

    if (this.featureGateService.canLoadEnrollments()) {
      this.loadEnrolledCounts();
    }
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
    if (!card.classGroupId || !this.featureGateService.canLoadEnrolledStudents()) return;

    this.enrollmentService.getStudentsByClassGroupId(card.classGroupId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (enrollments) => {
        const activeEnrollments = enrollments.filter(
          (e) => e.studentActive !== false && e.active !== false
        );

        card._students = activeEnrollments.map((e) => ({
          studentId: e.studentId,
          enrollmentId: e.id,
          studentName: e.studentName || '',
          studentPhone: e.studentPhone,
          enrollmentStatus: e.status,
        }));

        if (card.session.id) {
          this.attendanceService.getBySessionId(card.session.id).pipe(takeUntil(this.destroy$)).subscribe({
            next: (attendances) => {
              if (attendances.length > 0) {
                const attMap = new Map(attendances.filter((a) => a.enrollmentId).map((a) => [a.enrollmentId!, a.status]));
                for (const student of card._students || []) {
                  const status = student.enrollmentId ? attMap.get(student.enrollmentId) : undefined;
                  student.attendanceStatus = status;
                  student._originalStatus = status;
                }
              }
            },
            error: () => {},
          });
        }
      },
      error: () => {
        card._students = [];
        this.toastService.error('Erro ao carregar os alunos da aula.');
      },
    });
  }

  onAttendanceChange(card: SessionCard, student: SessionStudent, status: AttendanceStatus): void {
    if (student.attendanceStatus === status) return;
    student.attendanceStatus = status;
  }

  hasAttendanceChanges(card: SessionCard): boolean {
    const students = card._students || [];
    return students.some((s) => s.attendanceStatus !== s._originalStatus);
  }

  saveAttendances(card: SessionCard): void {
    const sessionId = card.session.id;
    if (!sessionId) return;

    const items = this.getModifiedAttendances(card);
    if (items.length === 0) return;

    this.savingAttendance[sessionId] = true;

    this.attendanceService.saveSessionAttendances(sessionId, { attendances: items }).pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.savingAttendance[sessionId] = false))
    ).subscribe({
      next: (responses) => {
        const resMap = new Map(responses.filter((r) => r.enrollmentId).map((r) => [r.enrollmentId!, r.status]));
        for (const student of card._students || []) {
          if (student.enrollmentId && resMap.has(student.enrollmentId)) {
            student.attendanceStatus = resMap.get(student.enrollmentId)!;
            student._originalStatus = student.attendanceStatus;
          }
        }
        this.toastService.success('Presenças salvas com sucesso.');
      },
      error: () => {
        for (const student of card._students || []) {
          student.attendanceStatus = student._originalStatus;
        }
        this.toastService.error('Erro ao salvar presenças. Alterações revertidas.');
      },
    });
  }

  private getModifiedAttendances(card: SessionCard): { enrollmentId: string; status: AttendanceStatus }[] {
    const students = card._students || [];
    return students
      .filter((s) => s.enrollmentId && s.attendanceStatus !== s._originalStatus)
      .map((s) => ({ enrollmentId: s.enrollmentId!, status: s.attendanceStatus! }));
  }

  isSaving(card: SessionCard): boolean {
    return card.session.id ? !!this.savingAttendance[card.session.id] : false;
  }

  getSessionStudents(card: SessionCard): SessionStudent[] {
    return card._students || [];
  }

  getPresenceLabel(status?: AttendanceStatus): string {
    const map: Record<string, string> = {
      PRESENT: 'Presente',
      ABSENT: 'Ausente',
      JUSTIFIED: 'Justificado',
    };
    return status ? map[status] || '-' : '-';
  }

  getPresenceStatus(status?: AttendanceStatus): ChipStatus {
    const map: Record<string, ChipStatus> = {
      PRESENT: 'success',
      ABSENT: 'cancelled',
      JUSTIFIED: 'warning',
    };
    return status ? map[status] || 'pending' : 'pending';
  }

  startSession(card: SessionCard): void {
    const id = card.session.id;
    if (!id || this.sessionActionLoading[id]) return;

    this.sessionActionLoading[id] = true;
    this.sessionService.start(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.sessionActionLoading[id] = false))
    ).subscribe({
      next: () => {
        card.session.status = 'IN_PROGRESS';
        this.toastService.success('Aula iniciada com sucesso.');
      },
      error: () => {
        this.toastService.error('Erro ao iniciar aula.');
      },
    });
  }

  completeSession(card: SessionCard): void {
    const id = card.session.id;
    if (!id || this.sessionActionLoading[id]) return;

    if (this.hasAttendanceChanges(card)) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Finalizar Aula',
          message: 'Existem alterações de presença não salvas. Deseja salvar as presenças antes de finalizar a aula?',
          confirmText: 'Salvar e Finalizar',
          cancelText: 'Cancelar',
        },
      });

      dialogRef.afterClosed().pipe(
        takeUntil(this.destroy$)
      ).subscribe((confirmed) => {
        if (confirmed) {
          this.saveAttendancesAndComplete(card);
        }
      });
      return;
    }

    this.executeComplete(card);
  }

  private saveAttendancesAndComplete(card: SessionCard): void {
    const sessionId = card.session.id;
    if (!sessionId) return;

    const items = this.getModifiedAttendances(card);
    if (items.length === 0) {
      this.executeComplete(card);
      return;
    }

    this.attendanceService.saveSessionAttendances(sessionId, { attendances: items }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        for (const student of card._students || []) {
          student._originalStatus = student.attendanceStatus;
        }
        this.executeComplete(card);
      },
      error: () => {
        this.toastService.error('Erro ao salvar presenças. Aula não finalizada.');
      },
    });
  }

  private executeComplete(card: SessionCard): void {
    const id = card.session.id;
    if (!id) return;

    this.sessionActionLoading[id] = true;
    this.sessionService.complete(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.sessionActionLoading[id] = false))
    ).subscribe({
      next: () => {
        card.session.status = 'COMPLETED';
        this.toastService.success('Aula finalizada com sucesso.');
      },
      error: () => {
        this.toastService.error('Erro ao finalizar aula.');
      },
    });
  }

  cancelSession(card: SessionCard): void {
    const id = card.session.id;
    if (!id || this.sessionActionLoading[id]) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancelar Aula',
        message: 'Tem certeza que deseja cancelar esta aula?',
        confirmText: 'Cancelar Aula',
        cancelText: 'Voltar',
      },
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$),
      switchMap((confirmed) => {
        if (!confirmed) return of(null);
        this.sessionActionLoading[id] = true;
        return this.sessionService.cancel(id).pipe(
          finalize(() => (this.sessionActionLoading[id] = false))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        if (result) {
          card.session.status = 'CANCELLED';
          this.toastService.success('Aula cancelada.');
        }
      },
      error: () => {
        this.sessionActionLoading[id] = false;
        this.toastService.error('Erro ao cancelar aula.');
      },
    });
  }

  canStart(card: SessionCard): boolean {
    return card.session.status === 'SCHEDULED';
  }

  canComplete(card: SessionCard): boolean {
    return card.session.status === 'IN_PROGRESS';
  }

  canCancel(card: SessionCard): boolean {
    return card.session.status === 'SCHEDULED' || card.session.status === 'IN_PROGRESS';
  }

  isSessionReadonly(card: SessionCard): boolean {
    return card.session.status === 'COMPLETED' || card.session.status === 'CANCELLED';
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
