import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardAlertCardComponent } from './dashboard-alert-card.component';
import { DashboardAlert } from '../../dashboard.model';

describe('DashboardAlertCardComponent', () => {
  let component: DashboardAlertCardComponent;
  let fixture: ComponentFixture<DashboardAlertCardComponent>;

  const mockAlerts: DashboardAlert[] = [
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
      message: '30 reposições pendentes',
      severity: 'WARNING',
      type: 'PENDING_MAKEUP',
      actionLabel: 'Ver reposições',
      actionRoute: '/makeup-requests',
      actionId: null,
    },
    {
      title: 'Aula em Andamento',
      message: 'Pilates Funcional está acontecendo',
      severity: 'INFO',
      type: 'ONGOING_CLASS',
      actionLabel: 'Ver aula',
      actionRoute: '',
      actionId: null,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAlertCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAlertCardComponent);
    component = fixture.componentInstance;
    component.alerts = mockAlerts;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders all alerts', () => {
    const cards = fixture.debugElement.queryAll(By.css('.alert-card'));
    expect(cards.length).toBe(3);
  });

  it('shows alert titles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Turma Lotada');
    expect(compiled.textContent).toContain('Muitas Reposições');
  });

  it('shows severity labels', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Crítico');
    expect(compiled.textContent).toContain('Atenção');
    expect(compiled.textContent).toContain('Informativo');
  });

  it('applies correct severity class for ERROR', () => {
    const errorCard = fixture.debugElement.query(By.css('.severity-error'));
    expect(errorCard).toBeTruthy();
  });

  it('applies correct severity class for WARNING', () => {
    const warningCard = fixture.debugElement.query(By.css('.severity-warning'));
    expect(warningCard).toBeTruthy();
  });

  it('applies correct severity class for INFO', () => {
    const infoCard = fixture.debugElement.query(By.css('.severity-info'));
    expect(infoCard).toBeTruthy();
  });

  it('emits resolve on action button click', () => {
    spyOn(component.resolve, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('.alert-action'));
    expect(buttons.length).toBe(2);
    buttons[0].triggerEventHandler('click', null);
    expect(component.resolve.emit).toHaveBeenCalledWith(mockAlerts[0]);
  });

  it('has accessible structure with role list', () => {
    const list = fixture.debugElement.query(By.css('[role="list"]'));
    expect(list).toBeTruthy();
  });
});
