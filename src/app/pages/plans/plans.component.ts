import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DsPageHeaderComponent, DsStatusChipComponent } from '../../shared/design-system';
import { ResponsiveCrudLayoutComponent } from '../../shared/components';
import { CrudActionsComponent, CrudAction } from '../../shared/components/crud';
import { PlanService } from '../../features/plans/plan.service';
import { Plan, PlanType, PlanTypeLabels } from '../../features/plans/plan.model';
import { ToastService } from '../../core/services/toast.service';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatSelectModule, MatFormFieldModule, ReactiveFormsModule,
    DsPageHeaderComponent, DsStatusChipComponent, ResponsiveCrudLayoutComponent,
    CrudActionsComponent, MatTableModule
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss'
})
export class PlansComponent implements OnInit {
  private planService = inject(PlanService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);
  private featureGateService = inject(FeatureGateService);

  displayedColumns: string[] = ['name', 'type', 'value', 'duration', 'active', 'actions'];
  plans: Plan[] = [];
  filteredPlans: Plan[] = [];
  dataSource = new MatTableDataSource<Plan>([]);
  searchValue = '';
  statusFilter = 'all';
  isLoading = false;

  readonly crudActions: CrudAction[] = [
    { label: 'Editar', icon: 'edit', action: 'edit' },
    { label: 'Inativar', icon: 'cancel', action: 'inactivate' },
    { label: 'Excluir', icon: 'delete', action: 'delete' },
  ];

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading = true;
    this.planService.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  applyFilters(): void {
    this.filteredPlans = this.plans.filter(p => {
      const matchesSearch = !this.searchValue || p.name.toLowerCase().includes(this.searchValue.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && p.active) ||
        (this.statusFilter === 'inactive' && !p.active);
      return matchesSearch && matchesStatus;
    });
    this.dataSource.data = this.filteredPlans;
  }

  onSearchChange(value: string): void { this.searchValue = value; this.applyFilters(); }
  onStatusFilterChange(value: string): void { this.statusFilter = value; this.applyFilters(); }

  getPlanTypeLabel(type: PlanType): string { return PlanTypeLabels[type] || type; }
  getActiveStatus(active: boolean): string { return active ? 'Ativo' : 'Inativo'; }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  navigateToNew(): void { this.router.navigate(['/plans/new']); }

  onAction(event: { action: string; item: Plan }): void {
    switch (event.action) {
      case 'edit':
        if (event.item.id) this.router.navigate(['/plans', event.item.id, 'edit']);
        break;
      case 'inactivate':
        this.inactivatePlan(event.item);
        break;
      case 'delete':
        this.deletePlan(event.item);
        break;
    }
  }

  private inactivatePlan(plan: Plan): void {
    if (!plan.id) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Inativar Plano', message: `Tem certeza que deseja inativar o plano "${plan.name}"?`, confirmText: 'Inativar', cancelText: 'Cancelar' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.planService.inactivatePlan(plan.id!).subscribe({
          next: () => { this.loadPlans(); this.toastService.success('Plano inativado com sucesso'); },
          error: (err) => this.toastService.error(err.error?.message || 'Erro ao inativar plano')
        });
      }
    });
  }

  private deletePlan(plan: Plan): void {
    if (!plan.id) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Plano', message: `Tem certeza que deseja excluir o plano "${plan.name}"?`, confirmText: 'Excluir', cancelText: 'Cancelar' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.planService.deletePlan(plan.id!).subscribe({
          next: () => { this.loadPlans(); this.toastService.success('Plano excluído com sucesso'); },
          error: (err) => this.toastService.error(err.error?.message || 'Erro ao excluir plano')
        });
      }
    });
  }
}
