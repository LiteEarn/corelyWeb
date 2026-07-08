import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardTimelineComponent } from './dashboard-timeline.component';
import { UpcomingSession } from '../../dashboard.model';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('DashboardTimelineComponent', () => {
  let component: DashboardTimelineComponent;
  let fixture: ComponentFixture<DashboardTimelineComponent>;

  const mockSessions: UpcomingSession[] = [
    {
      id: 's1',
      classGroupId: 'cg-1',
      className: 'Pilates Funcional',
      instructorId: 'i1',
      instructorName: 'Maria Souza',
      startTime: '08:00:00',
      endTime: '09:00:00',
      enrolledStudents: 8,
      status: 'SCHEDULED',
    },
    {
      id: 's2',
      classGroupId: 'cg-2',
      className: 'Alongamento',
      instructorId: 'i2',
      instructorName: 'Carlos Lima',
      startTime: '09:00:00',
      endTime: '10:00:00',
      enrolledStudents: 5,
      status: 'IN_PROGRESS',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTimelineComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardTimelineComponent);
    component = fixture.componentInstance;
    component.sessions = mockSessions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders all sessions', () => {
    const items = fixture.debugElement.queryAll(By.css('.timeline-item'));
    expect(items.length).toBe(2);
  });

  it('shows class names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pilates Funcional');
    expect(compiled.textContent).toContain('Alongamento');
  });

  it('shows instructor names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Souza');
    expect(compiled.textContent).toContain('Carlos Lima');
  });

  it('shows student counts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8 alunos');
    expect(compiled.textContent).toContain('5 alunos');
  });

  it('emits openSession on button click', () => {
    spyOn(component.openSession, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('ds-button'));
    buttons[0].triggerEventHandler('click', null);
    expect(component.openSession.emit).toHaveBeenCalledWith('s1');
  });

  it('formats time correctly', () => {
    expect(component.formatTime('08:00:00')).toBe('08:00');
    expect(component.formatTime('')).toBe('');
  });

  it('has accessible structure', () => {
    const list = fixture.debugElement.query(By.css('[role="list"]'));
    expect(list).toBeTruthy();
    const items = fixture.debugElement.queryAll(By.css('[role="listitem"]'));
    expect(items.length).toBe(2);
  });
});
