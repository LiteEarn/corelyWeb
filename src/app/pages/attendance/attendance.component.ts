import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DsPageHeaderComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { AttendanceService } from '../../features/attendance/attendance.service';
import { Attendance } from '../../features/attendance/attendance.model';
import { AttendanceBulkRequest, AttendanceItem } from '../../features/attendance/attendance-bulk-request.model';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { Enrollment } from '../../features/enrollments/enrollment.model';
import { CurrentStudioService } from '../../core/services/current-studio.service';
import { ToastService } from '../../core/services/toast.service';

interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentPhone: string;
  present: boolean;
  observation: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent
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

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private classGroupService: ClassGroupService,
    private enrollmentService: EnrollmentService,
    private currentStudioService: CurrentStudioService,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      classGroupId: [''],
      attendanceDate: [new Date()]
    });
  }

  ngOnInit(): void {
    this.loadClassGroups();
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

    // Load enrolled students
    this.enrollmentService.getByClassGroupId(classGroupId).subscribe({
      next: (enrollments) => {
        // Initialize students with default attendance (present = true)
        this.studentsAttendance = enrollments.map(enrollment => ({
          studentId: enrollment.studentId,
          studentName: enrollment.studentName || '',
          studentPhone: enrollment.studentPhone || '',
          present: true,
          observation: ''
        }));

        // Load existing attendance for this date
        const formattedDate = this.formatDateForApi(attendanceDate);
        this.attendanceService.getByClassGroupIdAndDate(classGroupId, formattedDate).subscribe({
          next: (existingAttendance) => {
            // Update students with existing attendance data
            existingAttendance.forEach(att => {
              const student = this.studentsAttendance.find(s => s.studentId === att.studentId);
              if (student) {
                student.present = att.present;
                student.observation = att.observation || '';
              }
            });
            this.hasLoadedStudents = true;
            this.isLoading = false;
          },
          error: (error) => {
            // If no existing attendance found, that's okay - we'll create new
            console.log('No existing attendance found for this date');
            this.hasLoadedStudents = true;
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.isLoading = false;
        this.toastService.error('Erro ao carregar alunos.');
      }
    });
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
      },
      error: (error) => {
        console.error('Error saving attendance:', error);
      }
    });
  }

  formatDateForApi(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatPhone(phone: string): string {
    if (!phone) return '-';
    return phone;
  }
}
