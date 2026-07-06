import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { ReactiveFormsModule } from "@angular/forms";
import { ToastService } from '../../core/services/toast.service';
import { DeactivateDialogComponent } from './deactivate-dialog.component';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

@Component({
  selector: 'app-class-groups',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsStatusChipComponent,
    DsEmptyStateComponent
  ],
  templateUrl: './class-groups.component.html',
  styleUrl: './class-groups.component.scss'
})
export class ClassGroupsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'instructor', 'days', 'time', 'capacity', 'status', 'actions'];
  classGroups: ClassGroup[] = [];
  filteredClassGroups: ClassGroup[] = [];
  dataSource = new MatTableDataSource<ClassGroup>([]);
  instructors: Instructor[] = [];
  searchValue: string = '';
  instructorFilter: string = 'all';
  activeFilter: string = 'all';

  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);

  constructor(
    private classGroupService: ClassGroupService,
    private instructorService: InstructorService,
    private featureGateService: FeatureGateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.featureGateService.canLoadClassGroups()) {
      this.loadClassGroups();
    }
    if (this.featureGateService.canLoadInstructors()) {
      this.loadInstructors();
    }
  }

  loadClassGroups(): void {
    if (!this.featureGateService.canLoadClassGroups()) {
      return;
    }
    this.classGroupService.getAll().subscribe({
      next: (data) => {
        console.log('ClassGroups API Response', data);
        this.classGroups = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading class groups:', error);
      }
    });
  }

  loadInstructors(): void {
    if (!this.featureGateService.canLoadInstructors()) {
      return;
    }
    this.instructorService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.instructors = data;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredClassGroups = this.classGroups.filter(classGroup => {
      const matchesSearch = !this.searchValue ||
        classGroup.name.toLowerCase().includes(this.searchValue.toLowerCase());

      const matchesInstructor = this.instructorFilter === 'all' ||
        classGroup.instructorId === this.instructorFilter;

      const matchesActive = this.activeFilter === 'all' ||
        (this.activeFilter === 'active' && classGroup.active) ||
        (this.activeFilter === 'inactive' && !classGroup.active);

      return matchesSearch && matchesInstructor && matchesActive;
    });
    this.dataSource.data = this.filteredClassGroups;
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.applyFilters();
  }

  onInstructorFilterChange(value: string): void {
    this.instructorFilter = value;
    this.applyFilters();
  }

  onActiveFilterChange(value: string): void {
    this.activeFilter = value;
    this.applyFilters();
  }

  getInstructorName(instructorId: string, classGroup: ClassGroup): string {
    const instructor = this.instructors.find(i => i.id === instructorId);
    return instructor ? instructor.fullName : classGroup.instructorName || 'Não encontrado';
  }

  getDaysString(classGroup: ClassGroup): string {
    const days: string[] = [];
    if (classGroup.monday) days.push('Seg');
    if (classGroup.tuesday) days.push('Ter');
    if (classGroup.wednesday) days.push('Qua');
    if (classGroup.thursday) days.push('Qui');
    if (classGroup.friday) days.push('Sex');
    if (classGroup.saturday) days.push('Sáb');
    if (classGroup.sunday) days.push('Dom');
    return days.length > 0 ? days.join(' • ') : '-';
  }

  formatTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  hasNoInstructor(classGroup: ClassGroup): boolean {
    return !classGroup.instructorId || classGroup.instructorId.trim() === '';
  }

  navigateToNew(): void {
    this.router.navigate(['/class-groups/new']);
  }

  deactivateClassGroup(classGroup: ClassGroup): void {
    const id = classGroup.id;
    if (!id) return;
    if (!this.featureGateService.canInactivateClassGroup()) return;

    this.openDeactivateDialog(id);
  }

  private openDeactivateDialog(id: string): void {
    const dialogRef = this.dialog.open(DeactivateDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { classGroupId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.toastService.success('Turma desativada com sucesso.');
        this.loadClassGroups();
      }
    });
  }

  reactivateClassGroup(classGroup: ClassGroup): void {
    const id = classGroup.id;
    if (!id) return;
    if (!this.featureGateService.canReactivateClassGroup()) return;

    this.classGroupService.reactivate(id).subscribe({
      next: () => {
        this.toastService.success('Turma reativada.\nAs próximas aulas foram geradas automaticamente.');
        this.loadClassGroups();
      },
      error: () => {
        this.toastService.error('Erro ao reativar turma. Tente novamente.');
      }
    });
  }
}
