import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { OperationalDashboard } from './dashboard.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  const mockDashboard: OperationalDashboard = {
    todayClasses: 5,
    ongoingClasses: 2,
    presentStudents: 18,
    pendingMakeups: 3,
    upcomingSessions: [
      {
        id: 's1',
        startTime: '08:00',
        endTime: '09:00',
        className: 'Pilates',
        instructorName: 'Ana',
        enrolledCount: 6,
        capacity: 10,
        status: 'SCHEDULED',
      },
      {
        id: 's2',
        startTime: '09:00',
        endTime: '10:00',
        className: 'Yoga',
        instructorName: 'Carlos',
        enrolledCount: 8,
        capacity: 8,
        status: 'IN_PROGRESS',
      },
    ],
    pendingMakeupRequests: [
      {
        id: 'm1',
        studentName: 'Maria',
        className: 'Pilates',
        absenceDate: '2026-06-20',
      },
    ],
    classOccupancy: [
      { className: 'Pilates Funcional', enrolledCount: 6, capacity: 8 },
      { className: 'Yoga', enrolledCount: 8, capacity: 8 },
    ],
    alerts: [
      { type: 'full_class', message: 'Turma "Yoga" lotada (8/8)' },
      { type: 'pending_makeup', message: '3 reposição(ões) pendente(s) de aprovação' },
      { type: 'ongoing_class', message: '2 aula(s) em andamento agora' },
    ],
  };

  const emptyDashboard: OperationalDashboard = {
    todayClasses: 0,
    ongoingClasses: 0,
    presentStudents: 0,
    pendingMakeups: 0,
    upcomingSessions: [],
    pendingMakeupRequests: [],
    classOccupancy: [],
    alerts: [],
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
  });

  describe('cards', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('displays stat cards', () => {
      const cards = fixture.debugElement.queryAll(By.css('app-stat-card'));
      expect(cards.length).toBe(4);
    });

    it('shows correct values in cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Aulas Hoje');
      expect(compiled.textContent).toContain('5');
      expect(compiled.textContent).toContain('Aulas em Andamento');
      expect(compiled.textContent).toContain('2');
      expect(compiled.textContent).toContain('Alunos Presentes');
      expect(compiled.textContent).toContain('18');
      expect(compiled.textContent).toContain('Reposições Pendentes');
      expect(compiled.textContent).toContain('3');
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
      expect(compiled.textContent).toContain('Pilates');
      expect(compiled.textContent).toContain('Yoga');
      expect(compiled.textContent).toContain('Ana');
      expect(compiled.textContent).toContain('Carlos');
    });

    it('shows status chip for each session', () => {
      const chips = fixture.debugElement.queryAll(By.css('ds-status-chip'));
      expect(chips.length).toBeGreaterThan(0);
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
      expect(compiled.textContent).toContain('Maria');
      expect(compiled.textContent).toContain('Pilates');
    });

    it('navigates to makeup-approval on approve click', () => {
      const button = fixture.debugElement.query(By.css('.makeup-row ds-button'));
      expect(button).toBeTruthy();
      button.triggerEventHandler('click', null);
      expect(router.navigate).toHaveBeenCalledWith(['/makeup-approval']);
    });
  });

  describe('alerts', () => {
    beforeEach(() => {
      dashboardService.getOperationalDashboard.and.returnValue(of(mockDashboard));
      fixture.detectChanges();
    });

    it('displays alert list', () => {
      const rows = fixture.debugElement.queryAll(By.css('.alert-row'));
      expect(rows.length).toBe(3);
    });

    it('shows alert messages', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Turma');
      expect(compiled.textContent).toContain('lotada');
      expect(compiled.textContent).toContain('reposição');
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
  });

  describe('occupancy', () => {
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
      expect(compiled.textContent).toContain('75%');
      expect(compiled.textContent).toContain('100%');
    });

    it('shows progress bars', () => {
      const bars = fixture.debugElement.queryAll(By.css('mat-progress-bar'));
      expect(bars.length).toBe(2);
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

    it('calculates occupancy percentage', () => {
      expect(component.getOccupancyPercentage(6, 8)).toBe(75);
      expect(component.getOccupancyPercentage(0, 10)).toBe(0);
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
  });
});
