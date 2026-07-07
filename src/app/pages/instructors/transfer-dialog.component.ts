import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionService } from '../../core/rbac/permission.service';

@Component({
  selector: 'app-transfer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './transfer-dialog.component.html',
  styleUrl: './transfer-dialog.component.scss'
})
export class TransferDialogComponent implements OnInit {
  sourceInstructor: Instructor;
  activeClassGroups: ClassGroup[] = [];
  activeInstructors: Instructor[] = [];
  loading = true;
  transferring = false;
  targetInstructorControl = new FormControl('', Validators.required);
  errorStateMatcher: ErrorStateMatcher = new ErrorStateMatcher();
  selectedClassGroupIds: Set<string> = new Set<string>();

  constructor(
    public dialogRef: MatDialogRef<TransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { instructor: Instructor },
    private instructorService: InstructorService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar
  ) {
    this.sourceInstructor = data.instructor;
  }

  ngOnInit(): void {
    if (this.permissionService.hasPermission('INSTRUCTOR_READ')) {
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;

    // Load active class groups for source instructor
    if (!this.sourceInstructor.id) {
      console.error('Source instructor ID is missing');
      this.loading = false;
      return;
    }

    if (this.permissionService.hasPermission('INSTRUCTOR_READ')) {
      this.instructorService.getClassGroups(this.sourceInstructor.id).subscribe({
        next: (classGroups) => {
          this.activeClassGroups = classGroups.filter(cg => cg.active);
          // Select all class groups by default (filter out undefined IDs)
          this.selectedClassGroupIds = new Set(
            this.activeClassGroups
              .map(cg => cg.id)
              .filter((id): id is string => id !== undefined)
          );
          console.log('Active class groups:', this.activeClassGroups);
        },
        error: (error) => {
          console.error('Error loading class groups:', error);
          this.loading = false;
        }
      });
    }

    // Load active instructors (excluding source instructor)
    if (this.permissionService.hasPermission('INSTRUCTOR_READ')) {
      this.instructorService.getAll({ active: true }).subscribe({
        next: (instructors) => {
          this.activeInstructors = instructors.filter(i => i.id !== this.sourceInstructor.id);
          console.log('Active instructors:', this.activeInstructors);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading instructors:', error);
          this.loading = false;
        }
      });
    }
  }

  onConfirm(): void {
    if (this.targetInstructorControl.invalid) {
      this.targetInstructorControl.markAsTouched();
      return;
    }

    if (this.selectedClassGroupIds.size === 0) {
      this.snackBar.open('Selecione pelo menos uma turma.', 'Fechar', { duration: 3000 });
      return;
    }

    const targetInstructorId = this.targetInstructorControl.value;
    const sourceInstructorId = this.sourceInstructor.id;

    if (!sourceInstructorId || !targetInstructorId) {
      this.snackBar.open('Erro: IDs de instrutor inválidos.', 'Fechar', { duration: 3000 });
      return;
    }

    this.transferring = true;

    this.instructorService.transferClassGroups(
      sourceInstructorId,
      targetInstructorId,
      Array.from(this.selectedClassGroupIds)
    ).subscribe({
      next: (response) => {
        this.transferring = false;
        this.snackBar.open('Turmas transferidas com sucesso!', 'Fechar', { duration: 3000 });
        this.dialogRef.close({ success: true, updatedCount: response.updatedCount });
      },
      error: (error) => {
        this.transferring = false;
        console.error('Error transferring class groups:', error);
        const errorMessage = error.error?.message || error.message || 'Erro ao transferir turmas.';
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTargetInstructorName(): string {
    const targetId = this.targetInstructorControl.value;
    const instructor = this.activeInstructors.find(i => i.id === targetId);
    return instructor ? instructor.fullName : '';
  }

  getErrorMessage(): string {
    if (this.targetInstructorControl.hasError('required')) {
      return 'Selecione um instrutor de destino';
    }
    return '';
  }

  toggleClassGroupSelection(classGroupId: string | undefined): void {
    if (!classGroupId) return;
    if (this.selectedClassGroupIds.has(classGroupId)) {
      this.selectedClassGroupIds.delete(classGroupId);
    } else {
      this.selectedClassGroupIds.add(classGroupId);
    }
  }

  isClassGroupSelected(classGroupId: string | undefined): boolean {
    return classGroupId ? this.selectedClassGroupIds.has(classGroupId) : false;
  }

  selectAllClassGroups(): void {
    this.selectedClassGroupIds = new Set(
      this.activeClassGroups
        .map(cg => cg.id)
        .filter((id): id is string => id !== undefined)
    );
  }

  clearSelection(): void {
    this.selectedClassGroupIds.clear();
  }

  get selectedCount(): number {
    return this.selectedClassGroupIds.size;
  }

  get totalCount(): number {
    return this.activeClassGroups.length;
  }

  get isAllSelected(): boolean {
    return this.selectedClassGroupIds.size === this.activeClassGroups.length && this.activeClassGroups.length > 0;
  }

  get isConfirmDisabled(): boolean {
    return this.loading || this.transferring || this.targetInstructorControl.invalid || this.selectedClassGroupIds.size === 0;
  }
}
