import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { QuickActionsComponent } from './quick-actions.component';

describe('QuickActionsComponent', () => {
  let component: QuickActionsComponent;
  let fixture: ComponentFixture<QuickActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders 4 action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.quick-action-btn'));
    expect(buttons.length).toBe(4);
  });

  it('shows all action labels', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nova Presença');
    expect(compiled.textContent).toContain('Nova Matrícula');
    expect(compiled.textContent).toContain('Novo Aluno');
    expect(compiled.textContent).toContain('Agenda');
  });

  it('emits action on button click', () => {
    spyOn(component.actionClick, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('.quick-action-btn'));
    buttons[0].triggerEventHandler('click', null);
    expect(component.actionClick.emit).toHaveBeenCalledWith('attendance');
  });

  it('emits enrollment action', () => {
    spyOn(component.actionClick, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('.quick-action-btn'));
    buttons[1].triggerEventHandler('click', null);
    expect(component.actionClick.emit).toHaveBeenCalledWith('enrollment');
  });

  it('has accessible structure with group role', () => {
    const group = fixture.debugElement.query(By.css('[role="group"]'));
    expect(group).toBeTruthy();
    expect(group.attributes['aria-label']).toBe('Ações rápidas');
  });

  it('each button has aria-label', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.quick-action-btn'));
    buttons.forEach(btn => {
      expect(btn.attributes['aria-label']).toBeTruthy();
    });
  });
});
