import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DsPageHeaderComponent, DsEmptyStateComponent, DsButtonComponent, DsPageCardComponent } from '../../shared/design-system';
import { AttendanceService } from '../../features/attendance/attendance.service';
import { AttendanceBulkRequest, AttendanceItem } from '../../features/attendance/attendance-bulk-request.model';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { CurrentStudioService } from '../../core/services/current-studio.service';
import { ToastService } from '../../core/services/toast.service';

type StudentStatus = 'present' | 'absent' | 'reposition';

interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentPhone: string;
  present: boolean;
  observation: string;
  status: StudentStatus;
  observationExpanded: boolean;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent,
    DsButtonComponent,
    DsPageCardComponent
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit {
  filterForm: FormGroup;
  classGroups: ClassGroup[] = [];
  studentsAttendance: StudentAttendance[] = [];
  selectedClassGroupId: string = '';
  selectedDate: Date = new Date();
  hasLoadedStudents: boolean = false;
  isLoading: boolean = false;
  searchQuery: string = '';

  private originalAttendanceData: Map<string, { present: boolean; observation: string }> = new Map();

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private classGroupService: ClassGroupService,
    private enrollmentService: EnrollmentService,
    private currentStudioService: CurrentStudioService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      classGroupId: [''],
      attendanceDate: [new Date()]
    });
  }

  ngOnInit(): void {
    this.loadClassGroups();
  }

  get selectedClassGroup(): ClassGroup | null {
    const id = this.filterForm.get('classGroupId')?.value;
    if (!id) return null;
    return this.classGroups.find(cg => cg.id === id) || null;
  }

  get presentCount(): number {
    return this.studentsAttendance.filter(s => s.status === 'present').length;
  }

  get repositionCount(): number {
    return this.studentsAttendance.filter(s => s.status === 'reposition').length;
  }

  get totalCount(): number {
    return this.studentsAttendance.length;
  }

  get progressPercent(): number {
    if (this.totalCount === 0) return 0;
    return Math.round(((this.presentCount + this.repositionCount) / this.totalCount) * 100);
  }

  get pendingChangesCount(): number {
    if (this.originalAttendanceData.size === 0) return 0;
    return this.studentsAttendance.filter(s => {
      const original = this.originalAttendanceData.get(s.studentId);
      if (!original) return true;
      return s.present !== original.present || s.observation !== original.observation;
    }).length;
  }

  get filteredStudents(): StudentAttendance[] {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      return this.studentsAttendance;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.studentsAttendance.filter(s =>
      s.studentName.toLowerCase().includes(query)
    );
  }

  loadClassGroups(): void {
    this.classGroupService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.classGroups = data;
      },
      error: (error) => {
        console.error('Error loading class groups:', error);
      }
    });
  }

  loadStudents(): void {
    const classGroupId = this.filterForm.get('classGroupId')?.value;
    const attendanceDate = this.filterForm.get('attendanceDate')?.value;

    if (!classGroupId || !attendanceDate) {
      this.toastService.warning('Selecione uma turma e uma data.');
      return;
    }

    this.selectedClassGroupId = classGroupId;
    this.selectedDate = attendanceDate;
    this.isLoading = true;
    this.searchQuery = '';

    this.enrollmentService.getStudentsByClassGroupId(classGroupId).subscribe({
      next: (enrollments) => {
        const activeEnrollments = enrollments.filter(enrollment => {
          const studentActive = enrollment.studentActive !== false;
          const enrollmentActive = enrollment.active !== false;
          return studentActive && enrollmentActive;
        });

        this.studentsAttendance = activeEnrollments.map(enrollment => ({
          studentId: enrollment.studentId,
          studentName: enrollment.studentName || '',
          studentPhone: enrollment.studentPhone || '',
          present: true,
          observation: '',
          status: 'present' as StudentStatus,
          observationExpanded: false
        }));

        const formattedDate = this.formatDateForApi(attendanceDate);
        this.attendanceService.getByClassGroupIdAndDate(classGroupId, formattedDate).subscribe({
          next: (existingAttendance) => {
            existingAttendance.forEach(att => {
              const student = this.studentsAttendance.find(s => s.studentId === att.studentId);
              if (student) {
                student.present = att.present;
                student.observation = att.observation || '';
                student.status = att.present ? 'present' : 'absent';
              }
            });
            this.saveOriginalState();
            this.hasLoadedStudents = true;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.log('No existing attendance found for this date');
            this.saveOriginalState();
            this.hasLoadedStudents = true;
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.isLoading = false;
        this.toastService.error('Erro ao carregar alunos.');
        this.cdr.markForCheck();
      }
    });
  }

  setStatus(student: StudentAttendance, status: StudentStatus): void {
    student.status = status;
    student.present = status === 'present' || status === 'reposition';
    this.cdr.markForCheck();
  }

  toggleObservation(student: StudentAttendance): void {
    student.observationExpanded = !student.observationExpanded;
    this.cdr.markForCheck();
  }

  markAllPresent(): void {
    this.studentsAttendance.forEach(s => {
      s.status = 'present';
      s.present = true;
    });
    this.cdr.markForCheck();
  }

  markAllAbsent(): void {
    this.studentsAttendance.forEach(s => {
      s.status = 'absent';
      s.present = false;
    });
    this.cdr.markForCheck();
  }

  clearAll(): void {
    this.studentsAttendance.forEach(s => {
      const original = this.originalAttendanceData.get(s.studentId);
      if (original) {
        s.present = original.present;
        s.observation = original.observation;
        s.status = original.present ? 'present' : 'absent';
      } else {
        s.present = true;
        s.observation = '';
        s.status = 'present';
      }
    });
    this.cdr.markForCheck();
  }

  onSearchInput(): void {
    this.cdr.markForCheck();
  }

  private saveOriginalState(): void {
    this.originalAttendanceData = new Map(
      this.studentsAttendance.map(s => [s.studentId, { present: s.present, observation: s.observation }])
    );
  }

  saveAttendance(): void {
    if (!this.selectedClassGroupId || !this.selectedDate || this.studentsAttendance.length === 0) {
      this.toastService.warning('Selecione uma turma, data e carregue os alunos.');
      return;
    }

    const attendanceItems: AttendanceItem[] = this.studentsAttendance.map(student => ({
      studentId: student.studentId,
      present: student.present,
      observation: student.observation
    }));

    const bulkRequest: AttendanceBulkRequest = {
      studioId: this.currentStudioService.getStudioId(),
      classGroupId: this.selectedClassGroupId,
      attendanceDate: this.formatDateForApi(this.selectedDate),
      attendances: attendanceItems
    };

    this.attendanceService.bulkCreate(bulkRequest).subscribe({
      next: () => {
        this.toastService.success('Presença registrada com sucesso.');
        this.saveOriginalState();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error saving attendance:', error);
      }
    });
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatPhone(phone: string): string {
    if (!phone) return '-';
    return phone;
  }

  hasNoInstructor(): boolean {
    const classGroupId = this.filterForm.get('classGroupId')?.value;
    if (!classGroupId) return false;
    const classGroup = this.classGroups.find(cg => cg.id === classGroupId);
    return !classGroup || !classGroup.instructorId || classGroup.instructorId.trim() === '';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  formatDateDisplay(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compare = new Date(date);
    compare.setHours(0, 0, 0, 0);

    const diff = compare.getTime() - today.getTime();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === -1) return 'Ontem';
    if (diffDays === 1) return 'Amanhã';

    return date.toLocaleDateString('pt-BR');
  }
}
