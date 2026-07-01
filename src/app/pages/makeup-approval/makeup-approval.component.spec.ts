import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { MakeupApprovalComponent } from './makeup-approval.component';
import { MakeupRequestService } from '../../features/makeup-requests/makeup-request.service';
import { StudentService } from '../../features/students/student.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { ToastService } from '../../core/services/toast.service';
import { MakeupRequest } from '../../features/makeup-requests/makeup-request.model';
import { Instructor } from '../../features/instructors/instructor.model';
import { MatDialog } from '@angular/material/dialog';
import { MakeupApprovalApproveDialogComponent } from './makeup-approval-approve-dialog.component';
import { MakeupApprovalRejectDialogComponent } from './makeup-approval-reject-dialog.component';

describe('MakeupApprovalComponent', () => {
  let component: MakeupApprovalComponent;
  let fixture: ComponentFixture<MakeupApprovalComponent>;
  let makeupRequestService: jasmine.SpyObj<MakeupRequestService>;
  let studentService: jasmine.SpyObj<StudentService>;
  let instructorService: jasmine.SpyObj<InstructorService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockInstructor: Instructor = {
    id: 'inst-1',
    fullName: 'Ana Silva',
    phone: '11999999999',
    email: 'ana@test.com',
    specialty: 'Ballet',
    active: true,
  };

  const mockRequests: MakeupRequest[] = [
    {
      id: 'req-1',
      studentId: 'student-1',
      studentName: 'Maria Souza',
      className: 'Ballet Infantil',
      instructorId: 'inst-1',
      instructorName: 'Ana Silva',
      absenceDate: '2026-06-25',
      reason: 'Falta justificada por motivo de saúde.',
      status: 'REQUESTED',
    },
    {
      id: 'req-2',
      studentId: 'student-2',
      studentName: 'João Pedro',
      className: 'Ballet Infantil',
      instructorId: 'inst-1',
      instructorName: 'Ana Silva',
      absenceDate: '2026-06-26',
      reason: 'Problema familiar.',
      status: 'APPROVED',
    },
    {
      id: 'req-3',
      studentId: 'student-3',
      studentName: 'Julia Costa',
      className: 'Jazz',
      instructorId: 'inst-1',
      instructorName: 'Ana Silva',
      absenceDate: '2026-06-24',
      reason: 'Não compareceu.',
      status: 'REJECTED',
      rejectionReason: 'Motivo não justificado.',
    },
  ];

  beforeEach(async () => {
    makeupRequestService = jasmine.createSpyObj('MakeupRequestService', [
      'getAll',
      'approve',
      'reject',
    ]);
    studentService = jasmine.createSpyObj('StudentService', ['getAll']);
    instructorService = jasmine.createSpyObj('InstructorService', ['getAll']);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    makeupRequestService.getAll.and.returnValue(of(mockRequests));
    instructorService.getAll.and.returnValue(of([mockInstructor]));
    studentService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [MakeupApprovalComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MakeupRequestService, useValue: makeupRequestService },
        { provide: StudentService, useValue: studentService },
        { provide: InstructorService, useValue: instructorService },
        { provide: ToastService, useValue: toastService },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MakeupApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('list requests', () => {
    it('loads requests on init', () => {
      expect(makeupRequestService.getAll).toHaveBeenCalled();
      expect(component.filteredRequests.length).toBe(3);
    });

    it('displays request cards', () => {
      const cards = fixture.debugElement.queryAll(By.css('.request-card'));
      expect(cards.length).toBe(3);
    });

    it('displays student names in cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Maria Souza');
      expect(compiled.textContent).toContain('João Pedro');
      expect(compiled.textContent).toContain('Julia Costa');
    });
  });

  describe('filter by status', () => {
    it('filters requests when status changes', () => {
      component.statusFilter = 'APPROVED';
      component.onFilterChange();

      expect(component.filteredRequests.length).toBe(1);
      expect(component.filteredRequests[0].status).toBe('APPROVED');
    });

    it('shows all when filter is cleared', () => {
      component.statusFilter = 'APPROVED';
      component.onFilterChange();
      expect(component.filteredRequests.length).toBe(1);

      component.clearFilters();
      expect(component.filteredRequests.length).toBe(3);
      expect(component.statusFilter).toBe('');
    });
  });

  describe('approve dialog', () => {
    it('opens approve dialog for REQUESTED request', () => {
      const request = mockRequests[0];
      const dialogRef = { afterClosed: () => of({ sessionId: 'session-1' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.approve.and.returnValue(of({ ...request, status: 'APPROVED' }));

      component.openApproveDialog(request);

      expect(dialog.open).toHaveBeenCalledWith(MakeupApprovalApproveDialogComponent, {
        width: '480px',
        data: { makeupRequestId: 'req-1' },
      });
    });

    it('calls approve when dialog confirms with session', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ sessionId: 'session-1' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.approve.and.returnValue(of({ ...request, status: 'APPROVED' } as MakeupRequest));

      component.openApproveDialog(request);

      expect(makeupRequestService.approve).toHaveBeenCalledWith('req-1', {
        sessionId: 'session-1',
      });
    });

    it('shows success toast on approve', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ sessionId: 'session-1' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.approve.and.returnValue(of({ ...request, status: 'APPROVED' } as MakeupRequest));

      component.openApproveDialog(request);

      expect(toastService.success).toHaveBeenCalledWith('Reposição aprovada.');
    });

    it('updates request card after approve', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ sessionId: 'session-1' }) };
      dialog.open.and.returnValue(dialogRef as any);

      const updated = { ...request, status: 'APPROVED' as const };
      makeupRequestService.approve.and.returnValue(of(updated));

      component.openApproveDialog(request);

      expect(request.status).toBe('APPROVED');
    });

    it('shows error toast on approve failure', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ sessionId: 'session-1' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.approve.and.returnValue(throwError(() => new Error('Erro')));

      component.openApproveDialog(request);

      expect(toastService.error).toHaveBeenCalledWith('Não foi possível aprovar a reposição.');
    });

    it('does not call approve if dialog is cancelled', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of(null) };
      dialog.open.and.returnValue(dialogRef as any);

      component.openApproveDialog(request);

      expect(makeupRequestService.approve).not.toHaveBeenCalled();
    });
  });

  describe('reject dialog', () => {
    it('opens reject dialog for REQUESTED request', () => {
      const request = mockRequests[0];
      const dialogRef = { afterClosed: () => of({ reason: 'Motivo inválido.' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.reject.and.returnValue(of({ ...request, status: 'REJECTED' }));

      component.openRejectDialog(request);

      expect(dialog.open).toHaveBeenCalledWith(MakeupApprovalRejectDialogComponent, {
        width: '480px',
        data: { makeupRequestId: 'req-1' },
      });
    });

    it('calls reject when dialog confirms', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ reason: 'Motivo inválido.' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.reject.and.returnValue(of({ ...request, status: 'REJECTED' } as MakeupRequest));

      component.openRejectDialog(request);

      expect(makeupRequestService.reject).toHaveBeenCalledWith('req-1', {
        reason: 'Motivo inválido.',
      });
    });

    it('shows success toast on reject', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ reason: 'Motivo inválido.' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.reject.and.returnValue(of({ ...request, status: 'REJECTED' } as MakeupRequest));

      component.openRejectDialog(request);

      expect(toastService.success).toHaveBeenCalledWith('Reposição rejeitada.');
    });

    it('updates request card after reject', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ reason: 'Motivo inválido.' }) };
      dialog.open.and.returnValue(dialogRef as any);

      const updated = { ...request, status: 'REJECTED' as const, rejectionReason: 'Motivo inválido.' };
      makeupRequestService.reject.and.returnValue(of(updated));

      component.openRejectDialog(request);

      expect(request.status).toBe('REJECTED');
    });

    it('shows error toast on reject failure', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of({ reason: 'Motivo inválido.' }) };
      dialog.open.and.returnValue(dialogRef as any);

      makeupRequestService.reject.and.returnValue(throwError(() => new Error('Erro')));

      component.openRejectDialog(request);

      expect(toastService.error).toHaveBeenCalledWith('Não foi possível rejeitar a reposição.');
    });

    it('does not call reject if dialog is cancelled', () => {
      const request = { ...mockRequests[0] };
      const dialogRef = { afterClosed: () => of(null) };
      dialog.open.and.returnValue(dialogRef as any);

      component.openRejectDialog(request);

      expect(makeupRequestService.reject).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('shows loading component while loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const loading = fixture.debugElement.query(By.css('app-loading'));
      expect(loading).toBeTruthy();
    });

    it('hides loading when data is loaded', () => {
      component.loading = false;
      fixture.detectChanges();

      const loading = fixture.debugElement.query(By.css('app-loading'));
      expect(loading).toBeFalsy();
    });
  });

  describe('error state', () => {
    it('shows error state with retry button', () => {
      component.loading = false;
      component.error = 'Erro ao carregar solicitações de reposição.';
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('ds-empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.componentInstance.title).toBe('Erro ao carregar');
    });

    it('retries loading when retry is clicked', () => {
      makeupRequestService.getAll.calls.reset();

      component.loading = false;
      component.error = 'Erro ao carregar solicitações de reposição.';
      fixture.detectChanges();

      component.loadRequests();
      expect(makeupRequestService.getAll).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no requests match filters', () => {
      component.filteredRequests = [];
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('ds-empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.componentInstance.title).toBe('Nenhuma solicitação encontrada');
    });
  });

  describe('status chip', () => {
    it('maps REQUESTED to pending and Solicitada', () => {
      const result = component.getStatusChip('REQUESTED');
      expect(result.status).toBe('pending');
      expect(result.label).toBe('Solicitada');
    });

    it('maps APPROVED to success and Aprovada', () => {
      const result = component.getStatusChip('APPROVED');
      expect(result.status).toBe('success');
      expect(result.label).toBe('Aprovada');
    });

    it('maps REJECTED to cancelled and Rejeitada', () => {
      const result = component.getStatusChip('REJECTED');
      expect(result.status).toBe('cancelled');
      expect(result.label).toBe('Rejeitada');
    });

    it('maps USED to completed and Utilizada', () => {
      const result = component.getStatusChip('USED');
      expect(result.status).toBe('completed');
      expect(result.label).toBe('Utilizada');
    });

    it('maps EXPIRED to inactive and Expirada', () => {
      const result = component.getStatusChip('EXPIRED');
      expect(result.status).toBe('inactive');
      expect(result.label).toBe('Expirada');
    });
  });

  describe('action loading', () => {
    it('tracks loading state per action', () => {
      component.actionLoading['req-1'] = 'approve';
      expect(component.isActionLoading('req-1', 'approve')).toBeTrue();
      expect(component.isActionLoading('req-1', 'reject')).toBeFalse();
    });

    it('clears loading state after action', () => {
      component.actionLoading['req-1'] = 'approve';
      expect(component.isActionLoading('req-1', 'approve')).toBeTrue();

      component.actionLoading['req-1'] = '';
      expect(component.isActionLoading('req-1', 'approve')).toBeFalse();
    });
  });

  describe('clear filters', () => {
    it('resets all filters', () => {
      component.statusFilter = 'APPROVED';
      component.studentFilter = 'student-1';
      component.instructorFilter = 'inst-1';
      component.dateFilter = '2026-06-25';
      component.dateModel = new Date();
      component.clearFilters();

      expect(component.statusFilter).toBe('');
      expect(component.studentFilter).toBe('');
      expect(component.instructorFilter).toBe('');
      expect(component.dateFilter).toBe('');
      expect(component.dateModel).toBeNull();
    });

    it('calls loadRequests after clear', () => {
      spyOn(component, 'loadRequests');
      component.clearFilters();
      expect(component.loadRequests).toHaveBeenCalled();
    });
  });

  describe('formatDate', () => {
    it('formats date from yyyy-MM-dd to dd/MM/yyyy', () => {
      expect(component.formatDate('2026-06-25')).toBe('25/06/2026');
    });

    it('returns empty string for empty input', () => {
      expect(component.formatDate('')).toBe('');
    });
  });
});
