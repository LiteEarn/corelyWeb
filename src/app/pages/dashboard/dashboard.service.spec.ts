import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardOperationalResponse } from './dashboard.model';
import { API_CONFIG } from '../../core/config/api.config';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const mockResponse: DashboardOperationalResponse = {
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
      { classGroupId: 'cg-1', className: 'Pilates Funcional', capacity: 8, enrolled: 6, occupancyPercent: 75 },
    ],
    alerts: [
      { type: 'full_class', message: 'Turma "Yoga" lotada (8/8)' },
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
        expect(data.todayClasses).toBe(5);
        expect(data.ongoingClasses).toBe(2);
        expect(data.presentStudents).toBe(18);
        expect(data.pendingMakeups).toBe(3);
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
