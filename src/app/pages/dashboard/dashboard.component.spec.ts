import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardOperationalResponse } from './dashboard.model';

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

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        { provide: DashboardService, useValue: dashboardService },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
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

    it('displays 4 stat cards', () => {
      const cards = fixture.debugElement.queryAll(By.css('app-stat-card'));
      expect(cards.length).toBe(4);
    });

    it('shows "Aulas Hoje" with correct value', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Aulas Hoje');
      expect(compiled.textContent).toContain('9');
    });

    it('shows "Aulas em Andamento" with correct value', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Aulas em Andamento');
      expect(compiled.textContent).toContain('5');
    });

    it('shows "Alunos Presentes" with correct value', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Alunos Presentes');
      expect(compiled.textContent).toContain('23');
    });

    it('shows "Reposições Pendentes" with correct value', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Reposições Pendentes');
      expect(compiled.textContent).toContain('30');
    });
  });

  describe('indicators', () => {
    it('shows average occupancy from summary', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
      expect(component.computedAverageOccupancy).toBe(95);
    });

    it('shows attendance rate from summary', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
      expect(component.computedAttendanceRate).toBe(52);
    });

    it('returns 0 for average occupancy when no data', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(emptyDashboard));
      fixture.detectChanges();
      expect(component.computedAverageOccupancy).toBe(0);
    });

    it('returns 0 for attendance rate when no data', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(emptyDashboard));
      fixture.detectChanges();
      expect(component.computedAttendanceRate).toBe(0);
    });
  });

  describe('upcoming sessions', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('displays session list', () => {
      const rows = fixture.debugElement.queryAll(By.css('.session-row'));
      expect(rows.length).toBe(2);
    });

    it('shows session details', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Alongamento');
      expect(compiled.textContent).toContain('Pilates Avancado');
      expect(compiled.textContent).toContain('Ricardo Souza');
      expect(compiled.textContent).toContain('Fernanda Lima');
    });

    it('shows enrolled students', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('10 alunos');
      expect(compiled.textContent).toContain('3 alunos');
    });

    it('shows status chip for each session', () => {
      const chips = fixture.debugElement.queryAll(By.css('ds-status-chip'));
      expect(chips.length).toBeGreaterThan(0);
    });

    it('limits to 5 sessions when more exist', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(largeDashboard));
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.session-row'));
      expect(rows.length).toBe(5);
    });

    it('shows "Ver Agenda" footer when more than 5 sessions', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(largeDashboard));
      fixture.detectChanges();
      const footer = fixture.debugElement.query(By.css('.section-footer'));
      expect(footer).toBeTruthy();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ver Agenda');
    });

    it('hides footer when 5 or fewer sessions', () => {
      const footers = fixture.debugElement.queryAll(By.css('.section-footer'));
      expect(footers.length).toBe(0);
    });
  });

  describe('alerts', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('displays alert cards', () => {
      const cards = fixture.debugElement.queryAll(By.css('.alert-card'));
      expect(cards.length).toBe(2);
    });

    it('shows alert titles', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Turma Lotada');
      expect(compiled.textContent).toContain('Muitas Reposições');
    });

    it('shows alert messages', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('100% de ocupação');
      expect(compiled.textContent).toContain('30 reposições pendentes');
    });

    it('applies error severity class', () => {
      const errorAlert = fixture.debugElement.query(By.css('.alert-error'));
      expect(errorAlert).toBeTruthy();
    });

    it('applies warning severity class', () => {
      const warningAlert = fixture.debugElement.query(By.css('.alert-warning'));
      expect(warningAlert).toBeTruthy();
    });
  });

  describe('makeup requests', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('displays pending makeup list', () => {
      const rows = fixture.debugElement.queryAll(By.css('.makeup-row'));
      expect(rows.length).toBe(1);
    });

    it('shows student name and class', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Monica Santos Almeida');
      expect(compiled.textContent).toContain('Gestantes');
    });

    it('shows formatted date', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('26/06/2026');
    });

    it('shows approve button', () => {
      const button = fixture.debugElement.query(By.css('.makeup-row ds-button'));
      expect(button).toBeTruthy();
    });

    it('navigates to makeup-approval on approve click', () => {
      const button = fixture.debugElement.query(By.css('.makeup-row ds-button'));
      button.triggerEventHandler('click', null);
      expect(router.navigate).toHaveBeenCalledWith(['/makeup-approval']);
    });

    it('limits to 5 makeups when more exist', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(largeDashboard));
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.makeup-row'));
      expect(rows.length).toBe(5);
    });

    it('shows "Ver todas" footer when more than 5 makeups', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(largeDashboard));
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ver todas');
    });
  });

  describe('class occupancy', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('displays class occupancy rows', () => {
      const rows = fixture.debugElement.queryAll(By.css('.occupancy-row'));
      expect(rows.length).toBe(2);
    });

    it('shows occupancy percentage', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('100%');
    });

    it('shows enrollment count and capacity', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('10/10 alunos');
      expect(compiled.textContent).toContain('6/6 alunos');
    });

    it('shows progress bars', () => {
      const bars = fixture.debugElement.queryAll(By.css('mat-progress-bar'));
      expect(bars.length).toBe(2);
    });

    it('limits to 5 classes when more exist', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(largeDashboard));
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.occupancy-row'));
      expect(rows.length).toBe(5);
    });

    it('shows "Ver todas" footer when more than 5 classes', () => {
      dashboardService.getOperationalDashboard.and.returnValue(of(largeDashboard));
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ver todas');
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

    it('shows empty message for upcoming sessions', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nenhuma aula programada para hoje');
    });

    it('shows empty message for makeups', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nenhuma reposição pendente');
    });

    it('shows empty state for alerts', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nenhum alerta');
    });

    it('shows empty message for classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nenhuma turma cadastrada');
    });

    it('shows zero values in KPIs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('0');
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

    it('returns correct alert icon', () => {
      expect(component.getAlertIcon('FULL_CLASS')).toBe('group');
      expect(component.getAlertIcon('PENDING_MAKEUP')).toBe('assignment');
      expect(component.getAlertIcon('ONGOING_CLASS')).toBe('play_circle');
      expect(component.getAlertIcon('unknown')).toBe('info');
    });

    it('returns correct alert severity class', () => {
      expect(component.getAlertSeverityClass('ERROR')).toBe('alert-error');
      expect(component.getAlertSeverityClass('WARNING')).toBe('alert-warning');
      expect(component.getAlertSeverityClass('INFO')).toBe('alert-info');
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

    it('navigateToMakeups navigates to /makeup-approval', () => {
      component.navigateToMakeups();
      expect(router.navigate).toHaveBeenCalledWith(['/makeup-approval']);
    });

    it('navigateToClasses navigates to /class-groups', () => {
      component.navigateToClasses();
      expect(router.navigate).toHaveBeenCalledWith(['/class-groups']);
    });
  });
});
