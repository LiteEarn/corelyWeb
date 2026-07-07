import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { EnrollmentFormComponent } from './enrollment-form.component';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { StudentService } from '../../features/students/student.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { CurrentStudioService } from '../../core/services/current-studio.service';
import { ToastService } from '../../core/services/toast.service';
import { Student } from '../../features/students/student.model';

describe('EnrollmentFormComponent', () => {
  let component: EnrollmentFormComponent;
  let fixture: ComponentFixture<EnrollmentFormComponent>;
  let studentService: jasmine.SpyObj<StudentService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const activeStudent: Student = { id: 'a1', fullName: 'Ativo', phone: '', email: '', birthDate: '', active: true };
  const inactiveStudent: Student = { id: 'i1', fullName: 'Inativo', phone: '', email: '', birthDate: '', active: false };

  beforeEach(async () => {
    studentService = jasmine.createSpyObj('StudentService', ['getAll']);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', ['getAll', 'getById', 'create', 'update']);
    const classGroupService = jasmine.createSpyObj('ClassGroupService', ['getAll']);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    classGroupService.getAll.and.returnValue(of([]));
    enrollmentService.create.and.returnValue(of({} as any));

    const featureGateService = jasmine.createSpyObj('FeatureGateService', [
      'canLoadStudentDropdown', 'canLoadClassGroupDropdown',
      'canLoadEnrollments', 'canManageEnrollments',
    ]);
    featureGateService.canLoadStudentDropdown.and.returnValue(true);
    featureGateService.canLoadClassGroupDropdown.and.returnValue(true);
    featureGateService.canLoadEnrollments.and.returnValue(true);
    featureGateService.canManageEnrollments.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [EnrollmentFormComponent],
      providers: [
        provideNoopAnimations(),
        { provide: FeatureGateService, useValue: featureGateService },
        { provide: StudentService, useValue: studentService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: ClassGroupService, useValue: classGroupService },
        { provide: ToastService, useValue: toastService },
        { provide: CurrentStudioService, useValue: { getStudioId: () => 'studio-1' } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    studentService.getAll.and.returnValue(of([activeStudent]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('filters out inactive students returned by the backend', () => {
    studentService.getAll.and.returnValue(of([activeStudent, inactiveStudent]));

    fixture.detectChanges();

    expect(component.students).toEqual([activeStudent]);
    expect(component.students.some(s => s.id === inactiveStudent.id)).toBeFalse();
  });

  it('rejects creation for an inactive student with a friendly message', () => {
    studentService.getAll.and.returnValue(of([activeStudent, inactiveStudent]));
    fixture.detectChanges();

    // Force an inactive selection past the defensive list filter
    component.students = [inactiveStudent];
    component.enrollmentForm.setValue({
      studentId: inactiveStudent.id,
      classGroupId: 'c1',
      enrollmentDate: new Date(),
      status: 'active'
    });

    component.onSubmit();

    expect(toastService.error).toHaveBeenCalledWith('Não é possível matricular um aluno inativo.');
    expect(enrollmentService.create).not.toHaveBeenCalled();
  });

  it('creates an enrollment for an active student', () => {
    studentService.getAll.and.returnValue(of([activeStudent]));
    fixture.detectChanges();

    component.enrollmentForm.setValue({
      studentId: activeStudent.id,
      classGroupId: 'c1',
      enrollmentDate: new Date(),
      status: 'active'
    });

    component.onSubmit();

    expect(enrollmentService.create).toHaveBeenCalled();
    expect(toastService.success).toHaveBeenCalledWith('Matrícula criada com sucesso.');
  });
});
