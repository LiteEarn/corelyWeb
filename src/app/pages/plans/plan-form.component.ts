import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DsPageFormComponent, DsPageHeaderComponent, DsPageCardComponent } from '../../shared/design-system';
import { ResponsiveFormGridComponent, ResponsiveFormSectionComponent } from '../../shared/components';
import { PlanService } from '../../features/plans/plan.service';
import { Plan, PlanType, PlanTypeLabels } from '../../features/plans/plan.model';
import { CurrentStudioService } from '../../core/services/current-studio.service';
import { CustomValidators } from '../../shared/utils';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule,
    DsPageFormComponent, DsPageHeaderComponent, DsPageCardComponent,
    ResponsiveFormGridComponent, ResponsiveFormSectionComponent
  ],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.scss'
})
export class PlanFormComponent implements OnInit {
  planForm: FormGroup;
  isEditMode = false;
  planId: string | null = null;
  loading = false;
  saving = false;
  isSubmitting = false;
  isFormSubmitted = false;

  planTypes = Object.values(PlanType);
  planTypeLabels = PlanTypeLabels;

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private router: Router,
    private route: ActivatedRoute,
    private currentStudioService: CurrentStudioService
  ) {
    this.planForm = this.createForm();
  }

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.planId;
    if (this.isEditMode && this.planId) {
      this.loadPlan(this.planId);
    }
    this.onTypeChange();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [CustomValidators.required('Nome'), Validators.minLength(2)]],
      description: [''],
      type: ['', CustomValidators.required('Tipo')],
      value: ['', [CustomValidators.required('Valor'), Validators.min(0.01)]],
      quantityAulas: [''],
      duration: ['', [CustomValidators.required('Duração'), Validators.min(1)]],
      active: [true]
    });
  }

  onTypeChange(): void {
    this.planForm.get('type')?.valueChanges.subscribe(type => {
      const quantityControl = this.planForm.get('quantityAulas');
      if (type === PlanType.PACKAGE) {
        quantityControl?.setValidators([CustomValidators.required('Quantidade de Aulas'), Validators.min(1)]);
      } else {
        quantityControl?.clearValidators();
        quantityControl?.setValue('');
      }
      quantityControl?.updateValueAndValidity();
    });
  }

  loadPlan(id: string): void {
    this.loading = true;
    this.planService.getPlanById(id).subscribe({
      next: (plan) => {
        this.planForm.patchValue({
          ...plan,
          value: plan.value.toString()
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/plans']);
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.isFormSubmitted = true;
    if (this.planForm.valid) {
      this.saving = true;
      this.isSubmitting = true;
      const formValue = this.planForm.value;
      const planData: Plan = {
        ...formValue,
        value: parseFloat(formValue.value),
        quantityAulas: formValue.quantityAulas ? parseInt(formValue.quantityAulas, 10) : undefined,
        duration: parseInt(formValue.duration, 10),
        studioId: this.currentStudioService.getStudioId()
      };

      const operation = this.isEditMode
        ? this.planService.updatePlan(this.planId!, planData)
        : this.planService.createPlan(planData);

      operation.subscribe({
        next: () => {
          this.saving = false;
          this.isSubmitting = false;
          this.router.navigate(['/plans']);
        },
        error: () => {
          this.saving = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void { this.router.navigate(['/plans']); }

  shouldShowError(fieldName: string): boolean {
    const field = this.planForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.planForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) return '';
    if (field.errors['required']) return field.errors['required'].message || `${fieldName} é obrigatório`;
    if (field.errors['min']) return `Valor mínimo não atingido`;
    return 'Campo inválido';
  }

  get pageTitle(): string { return this.isEditMode ? 'Editar Plano' : 'Novo Plano'; }
  get pageSubtitle(): string { return this.isEditMode ? 'Atualize as informações do plano' : 'Adicione um novo plano à instituição'; }
}
