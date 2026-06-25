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
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

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
  targetInstructorControl = new FormControl('', Validators.required);
  errorStateMatcher: ErrorStateMatcher = new ErrorStateMatcher();

  constructor(
    public dialogRef: MatDialogRef<TransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { instructor: Instructor },
    private instructorService: InstructorService
  ) {
    this.sourceInstructor = data.instructor;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load active class groups for source instructor
    if (!this.sourceInstructor.id) {
      console.error('Source instructor ID is missing');
      this.loading = false;
      return;
    }

    this.instructorService.getClassGroups(this.sourceInstructor.id).subscribe({
      next: (classGroups) => {
        this.activeClassGroups = classGroups.filter(cg => cg.active);
        console.log('Active class groups:', this.activeClassGroups);
      },
      error: (error) => {
        console.error('Error loading class groups:', error);
        this.loading = false;
      }
    });

    // Load active instructors (excluding source instructor)
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

  onConfirm(): void {
    if (this.targetInstructorControl.invalid) {
      this.targetInstructorControl.markAsTouched();
      return;
    }

    const targetInstructorId = this.targetInstructorControl.value;
    this.dialogRef.close({
      sourceInstructorId: this.sourceInstructor.id,
      targetInstructorId: targetInstructorId
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
}
