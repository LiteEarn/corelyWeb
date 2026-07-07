import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { DashboardService } from './dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardOperationalResponse } from './dashboard.model';
import { ResponsiveService } from '../../shared/layout';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  const mockDashboard: DashboardOperationalResponse = {
    summary: {
      kpis: {
        classesToday: 9,
        classesInProgress: 5,
        activeStudents: 76,
        studentsPresentToday: 23,
        pendingMakeups: 30,
        averageOccupancy: 95,
        todayAttendanceRate: 52,
      },
      averageOccupancy: 95,
      todayAttendanceRate: 52,
    },
    upcomingSessions: [
      {
        id: 's1',
        classGroupId: 'cg-1',
        className: 'Alongamento',
        instructorId: 'i1',
        instructorName: 'Ricardo Souza',
        startTime: '08:00:00',
        endTime: '09:00:00',
        enrolledStudents: 10,
        status: 'IN_PROGRESS',
      },
      {
        id: 's2',
        classGroupId: 'cg-2',
        className: 'Pilates Avancado',
        instructorId: 'i2',
        instructorName: 'Fernanda Lima',
        startTime: '08:00:00',
        endTime: '09:00:00',
        enrolledStudents: 3,
        status: 'IN_PROGRESS',
      },
    ],
    pendingMakeupRequests: [
      {
        id: 'm1',
        classGroupId: 'cg-3',
        studentName: 'Monica Santos Almeida',
        className: 'Gestantes',
        absenceDate: '2026-06-26',
        reason: 'Imprevisto pessoal',
      },
    ],
    classOccupancy: [
      { classGroupId: 'cg-1', className: 'Alongamento', capacity: 10, enrolled: 10, occupancyPercent: 100 },
      { classGroupId: 'cg-2', className: 'Gestantes', capacity: 6, enrolled: 6, occupancyPercent: 100 },
    ],
    alerts: [
      {
        title: 'Turma Lotada',
        message: "Turma 'Alongamento' está com 100% de ocupação",
        severity: 'ERROR',
        type: 'FULL_CLASS',
        actionLabel: 'Ver turma',
        actionRoute: '/class-groups',
        actionId: 'cg-1',
      },
      {
        title: 'Muitas Reposições',
        message: '30 reposições pendentes aguardando aprovação',
        severity: 'WARNING',
        type: 'PENDING_MAKEUP',
        actionLabel: 'Ver reposições',
        actionRoute: '/makeup-requests',
        actionId: null,
      },
    ],
  };

  const emptyDashboard: DashboardOperationalResponse = {
    summary: {
      kpis: {
        classesToday: 0,
        classesInProgress: 0,
        activeStudents: 0,
        studentsPresentToday: 0,
        pendingMakeups: 0,
        averageOccupancy: 0,
        todayAttendanceRate: 0,
      },
      averageOccupancy: 0,
      todayAttendanceRate: 0,
    },
    upcomingSessions: [],
    pendingMakeupRequests: [],
    classOccupancy: [],
    alerts: [],
  };

  const largeDashboard: DashboardOperationalResponse = {
    ...mockDashboard,
    upcomingSessions: Array.from({ length: 8 }, (_, i) => ({
      id: `s${i}`,
      classGroupId: `cg-${i}`,
      className: `Turma ${i}`,
      instructorId: `i${i}`,
      instructorName: `Instrutor ${i}`,
      startTime: `0${i}:00:00`,
      endTime: `0${i + 1}:00:00`,
      enrolledStudents: 5 + i,
      status: 'SCHEDULED',
    })),
    pendingMakeupRequests: Array.from({ length: 7 }, (_, i) => ({
      id: `m${i}`,
      classGroupId: `cg-${i}`,
      studentName: `Aluno ${i}`,
      className: `Turma ${i}`,
      absenceDate: '2026-06-20',
      reason: `Motivo ${i}`,
    })),
    classOccupancy: Array.from({ length: 6 }, (_, i) => ({
      classGroupId: `cg-${i}`,
      className: `Turma ${i}`,
      capacity: 10,
      enrolled: 5 + i,
      occupancyPercent: 50 + i * 10,
    })),
  };

  beforeEach(async () => {
    dashboardService = jasmine.createSpyObj('DashboardService', ['getOperationalDashboard']);
    toastService = jasmine.createSpyObj('ToastService', ['error']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    const featureGateService = jasmine.createSpyObj('FeatureGateService', [
      'canViewDashboard',
    ]);
    featureGateService.canViewDashboard.and.returnValue(true);

    const breakpointObserverMock = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    const breakpointSubject = new Subject<BreakpointState>();
    breakpointObserverMock.observe.and.returnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        ResponsiveService,
        { provide: FeatureGateService, useValue: featureGateService },
        { provide: DashboardService, useValue: dashboardService },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('loading', () => {
    it('starts with loading true before data loads', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      expect(component.loading).toBeTrue();
    });

    it('sets loading to false after data loads', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
      expect(component.loading).toBeFalse();
    });

    it('sets loading to false after error', () => {
      dashboardService.getOperationalDashboard.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(component.loading).toBeFalse();
    });
  });

  describe('KPIs', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('creates 7 kpi items from data', () => {
      expect(component.kpiItems.length).toBe(7);
    });

    it('includes "Aulas Hoje"', () => {
      expect(component.kpiItems[0].label).toBe('Aulas Hoje');
      expect(component.kpiItems[0].value).toBe(9);
    });

    it('includes "Em Andamento"', () => {
      expect(component.kpiItems[1].label).toBe('Em Andamento');
    });

    it('includes "Alunos Ativos"', () => {
      expect(component.kpiItems[2].label).toBe('Alunos Ativos');
    });

    it('includes "Presentes Hoje"', () => {
      expect(component.kpiItems[3].label).toBe('Presentes Hoje');
    });

    it('includes "Reposições Pendentes"', () => {
      expect(component.kpiItems[4].label).toBe('Reposições Pendentes');
    });

    it('includes "Ocupação Média"', () => {
      expect(component.kpiItems[5].label).toBe('Ocupação Média');
    });

    it('includes "Frequência Hoje"', () => {
      expect(component.kpiItems[6].label).toBe('Frequência Hoje');
    });
  });

  describe('upcoming sessions', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('returns sessions slice', () => {
      expect(component.displayUpcomingSessions.length).toBe(2);
    });

    it('limits to 5 sessions when more exist', () => {
      component.data = largeDashboard;
      expect(component.displayUpcomingSessions.length).toBe(5);
    });
  });

  describe('alerts', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('returns alerts slice', () => {
      expect(component.displayAlerts.length).toBe(2);
    });

    it('shows alert titles', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Turma Lotada');
      expect(compiled.textContent).toContain('Muitas Reposições');
    });
  });

  describe('makeup requests', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('returns pending makeups slice', () => {
      expect(component.displayPendingMakeups.length).toBe(1);
    });

    it('limits to 5 makeups when more exist', () => {
      component.data = largeDashboard;
      expect(component.displayPendingMakeups.length).toBe(5);
    });

    it('shows student name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Monica Santos Almeida');
    });
  });

  describe('class occupancy', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('returns class occupancy slice', () => {
      expect(component.displayClassOccupancy.length).toBe(2);
    });

    it('limits to 5 classes when more exist', () => {
      component.data = largeDashboard;
      expect(component.displayClassOccupancy.length).toBe(5);
    });
  });

  describe('error', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
    });

    it('sets error state', () => {
      expect(component.error).toBeTrue();
      expect(component.loading).toBeFalse();
    });

    it('shows error empty state', () => {
      fixture.detectChanges();
      const emptyState = fixture.debugElement.query(By.css('ds-empty-state'));
      expect(emptyState).toBeTruthy();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Tentar novamente');
    });

    it('calls toast on error', () => {
      expect(toastService.error).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(emptyDashboard));
      fixture.detectChanges();
    });

    it('shows zero values in KPIs', () => {
      expect(component.kpiItems[0].value).toBe(0);
    });

    it('returns empty arrays for empty data', () => {
      expect(component.displayUpcomingSessions.length).toBe(0);
      expect(component.displayPendingMakeups.length).toBe(0);
      expect(component.displayClassOccupancy.length).toBe(0);
      expect(component.displayAlerts.length).toBe(0);
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('maps session status to chip status', () => {
      expect(component.getSessionStatus('SCHEDULED')).toBe('completed');
      expect(component.getSessionStatus('IN_PROGRESS')).toBe('warning');
      expect(component.getSessionStatus('COMPLETED')).toBe('success');
      expect(component.getSessionStatus('CANCELLED')).toBe('cancelled');
    });

    it('maps session status to label', () => {
      expect(component.getSessionStatusLabel('SCHEDULED')).toBe('Agendada');
      expect(component.getSessionStatusLabel('IN_PROGRESS')).toBe('Em andamento');
      expect(component.getSessionStatusLabel('COMPLETED')).toBe('Concluída');
      expect(component.getSessionStatusLabel('CANCELLED')).toBe('Cancelada');
    });

    it('returns correct color for occupancy', () => {
      expect(component.getOccupancyColor(85)).toBe('warn');
      expect(component.getOccupancyColor(65)).toBe('accent');
      expect(component.getOccupancyColor(30)).toBe('primary');
    });

    it('formats date to pt-BR', () => {
      expect(component.formatDate('2026-06-20')).toBe('20/06/2026');
      expect(component.formatDate('')).toBe('');
    });

    it('retry calls loadDashboard', () => {
      spyOn(component, 'loadDashboard');
      component.retry();
      expect(component.loadDashboard).toHaveBeenCalled();
    });

    it('navigateToSchedule navigates to /schedule', () => {
      component.navigateToSchedule();
      expect(router.navigate).toHaveBeenCalledWith(['/schedule']);
    });

    it('navigateToMakeupApproval navigates to /makeup-approval', () => {
      component.navigateToMakeupApproval();
      expect(router.navigate).toHaveBeenCalledWith(['/makeup-approval']);
    });

    it('navigateToClasses navigates to /class-groups', () => {
      component.navigateToClasses();
      expect(router.navigate).toHaveBeenCalledWith(['/class-groups']);
    });

    it('handleQuickAction navigates to correct routes', () => {
      component.handleQuickAction('attendance');
      expect(router.navigate).toHaveBeenCalledWith(['/attendance']);
      component.handleQuickAction('enrollment');
      expect(router.navigate).toHaveBeenCalledWith(['/enrollments/new']);
      component.handleQuickAction('student');
      expect(router.navigate).toHaveBeenCalledWith(['/students/new']);
      component.handleQuickAction('agenda');
      expect(router.navigate).toHaveBeenCalledWith(['/daily-agenda']);
    });

    it('resolveAlert navigates to action route', () => {
      const alert = mockDashboard.alerts[0];
      component.resolveAlert(alert);
      expect(router.navigate).toHaveBeenCalledWith(['/class-groups']);
    });

    it('openSession navigates to session', () => {
      component.openSession('s1');
      expect(router.navigate).toHaveBeenCalledWith(['/sessions', 's1']);
    });
  });
});
