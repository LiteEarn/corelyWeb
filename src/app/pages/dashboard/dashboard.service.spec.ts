import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardOperationalResponse } from './dashboard.model';
import { API_CONFIG } from '../../core/config/api.config';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const mockResponse: DashboardOperationalResponse = {
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
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOperationalDashboard', () => {
    it('faz uma única requisição HTTP GET para /dashboard/operational', () => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.dashboard}/operational`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('retorna os dados do dashboard corretamente', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data.summary.kpis.classesToday).toBe(9);
        expect(data.summary.kpis.classesInProgress).toBe(5);
        expect(data.summary.kpis.studentsPresentToday).toBe(23);
        expect(data.summary.kpis.pendingMakeups).toBe(30);
        expect(data.summary.kpis.activeStudents).toBe(76);
        expect(data.summary.averageOccupancy).toBe(95);
        expect(data.summary.todayAttendanceRate).toBe(52);
        expect(data.upcomingSessions.length).toBe(1);
        expect(data.pendingMakeupRequests.length).toBe(1);
        expect(data.classOccupancy.length).toBe(1);
        expect(data.alerts.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.dashboard}/operational`);
      req.flush(mockResponse);
    });

    it('propaga erro quando a requisição falha', (done) => {
      service.getOperationalDashboard().subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.dashboard}/operational`);
      req.flush('Erro interno', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
