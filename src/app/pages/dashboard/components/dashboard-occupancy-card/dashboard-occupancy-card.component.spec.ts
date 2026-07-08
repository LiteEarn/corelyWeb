import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardOccupancyCardComponent } from './dashboard-occupancy-card.component';
import { ClassOccupancy } from '../../dashboard.model';

describe('DashboardOccupancyCardComponent', () => {
  let component: DashboardOccupancyCardComponent;
  let fixture: ComponentFixture<DashboardOccupancyCardComponent>;

  const mockItems: ClassOccupancy[] = [
    { classGroupId: 'cg-1', className: 'Pilates Funcional', capacity: 10, enrolled: 8, occupancyPercent: 80 },
    { classGroupId: 'cg-2', className: 'Alongamento', capacity: 10, enrolled: 5, occupancyPercent: 50 },
    { classGroupId: 'cg-3', className: 'Gestantes', capacity: 6, enrolled: 6, occupancyPercent: 100 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOccupancyCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOccupancyCardComponent);
    component = fixture.componentInstance;
    component.items = mockItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders all occupancy items', () => {
    const items = fixture.debugElement.queryAll(By.css('.occupancy-item'));
    expect(items.length).toBe(3);
  });

  it('shows class names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pilates Funcional');
    expect(compiled.textContent).toContain('Alongamento');
    expect(compiled.textContent).toContain('Gestantes');
  });

  it('shows enrollment counts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8 / 10');
    expect(compiled.textContent).toContain('5 / 10');
    expect(compiled.textContent).toContain('6 / 6');
  });

  it('shows progress bars', () => {
    const bars = fixture.debugElement.queryAll(By.css('mat-progress-bar'));
    expect(bars.length).toBe(3);
  });

  it('has accessible progress bars with aria attributes', () => {
    const barWrappers = fixture.debugElement.queryAll(By.css('.occupancy-bar-wrapper'));
    expect(barWrappers.length).toBe(3);
    expect(barWrappers[0].attributes['role']).toBe('progressbar');
    expect(barWrappers[0].attributes['aria-valuenow']).toBe('80');
  });

  it('returns warn color for >=80%', () => {
    expect(component.getBarColor(85)).toBe('warn');
    expect(component.getBarColor(80)).toBe('warn');
  });

  it('returns accent color for 50-79%', () => {
    expect(component.getBarColor(65)).toBe('accent');
    expect(component.getBarColor(50)).toBe('accent');
  });

  it('returns primary color for <50%', () => {
    expect(component.getBarColor(30)).toBe('primary');
  });
});
