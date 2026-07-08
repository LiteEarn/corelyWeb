import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardSkeletonComponent } from './dashboard-skeleton.component';

describe('DashboardSkeletonComponent', () => {
  let component: DashboardSkeletonComponent;
  let fixture: ComponentFixture<DashboardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders 7 KPI skeleton placeholders', () => {
    const kpis = fixture.debugElement.queryAll(By.css('.skeleton-kpi'));
    expect(kpis.length).toBe(7);
  });

  it('renders skeleton grid with 2 cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('.skeleton-card'));
    expect(cards.length).toBe(2);
  });

  it('renders 4 action button skeletons', () => {
    const actionBtns = fixture.debugElement.queryAll(By.css('.skeleton-action-btn'));
    expect(actionBtns.length).toBe(4);
  });

  it('has role status for accessibility', () => {
    const container = fixture.debugElement.query(By.css('[role="status"]'));
    expect(container).toBeTruthy();
  });

  it('has sr-only text for screen readers', () => {
    const srText = fixture.debugElement.query(By.css('.sr-only'));
    expect(srText).toBeTruthy();
    expect(srText.nativeElement.textContent).toContain('Carregando');
  });

  it('applies mobile class when mode is mobile', () => {
    component.mode = 'mobile';
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('.skeleton-mobile'));
    expect(container).toBeTruthy();
  });
});
