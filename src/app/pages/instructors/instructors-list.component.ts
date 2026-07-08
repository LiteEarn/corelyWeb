import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { DsPageHeaderComponent, DsStatusChipComponent } from '../../shared/design-system';
import { ResponsiveCrudComponent, CrudActionsComponent, CrudAction } from '../../shared/components/crud';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { ReactiveFormsModule } from "@angular/forms";
import { TransferDialogComponent } from './transfer-dialog.component';
import { ToastService } from '../../core/services/toast.service';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

@Component({
  selector: 'app-instructors-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsStatusChipComponent,
    ResponsiveCrudComponent,
    CrudActionsComponent,
  ],
  templateUrl: './instructors-list.component.html',
  styleUrl: './instructors-list.component.scss'
})
export class InstructorsListComponent implements OnInit {
  private instructorService = inject(InstructorService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);
  private featureGateService = inject(FeatureGateService);

  displayedColumns: string[] = ['fullName', 'specialty', 'phone', 'active', 'actions'];
  instructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  dataSource = new MatTableDataSource<Instructor>([]);
  searchValue = '';
  statusFilter = 'all';

  readonly crudActions: CrudAction[] = [
    { label: 'Visualizar', icon: 'visibility', action: 'view' },
    { label: 'Editar', icon: 'edit', action: 'edit' },
    { label: 'Transferir Alunos', icon: 'swap_horiz', action: 'transfer' },
  ];

  ngOnInit(): void {
    if (this.featureGateService.canLoadInstructors()) {
      this.loadInstructors();
    }
  }

  loadInstructors(): void {
    this.instructorService.getAll().subscribe({
      next: (data) => {
        this.instructors = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredInstructors = this.instructors.filter(instructor => {
      const matchesSearch = !this.searchValue ||
        instructor.fullName.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        instructor.email.toLowerCase().includes(this.searchValue.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && instructor.active) ||
        (this.statusFilter === 'inactive' && !instructor.active);

      return matchesSearch && matchesStatus;
    });
    this.dataSource.data = this.filteredInstructors;
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.applyFilters();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  getActiveStatus(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }

  navigateToNew(): void {
    this.router.navigate(['/instructors/new']);
  }

  onAction(event: { action: string; item: Instructor }): void {
    switch (event.action) {
      case 'view':
        if (event.item.id) this.router.navigate(['/instructors', event.item.id]);
        break;
      case 'edit':
        if (event.item.id) this.router.navigate(['/instructors', event.item.id, 'edit']);
        break;
      case 'transfer':
        this.openTransferDialog(event.item);
        break;
    }
  }

  openTransferDialog(instructor: Instructor): void {
    if (!this.featureGateService.canTransferInstructor()) return;
    const dialogRef = this.dialog.open(TransferDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { instructor }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loadInstructors();
      }
    });
  }
}
