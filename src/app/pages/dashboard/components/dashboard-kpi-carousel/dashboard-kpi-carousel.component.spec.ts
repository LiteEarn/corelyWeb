import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardKpiCarouselComponent, KpiItem } from './dashboard-kpi-carousel.component';

describe('DashboardKpiCarouselComponent', () => {
  let component: DashboardKpiCarouselComponent;
  let fixture: ComponentFixture<DashboardKpiCarouselComponent>;

  const mockItems: KpiItem[] = [
    { label: 'Aulas Hoje', value: 9, icon: 'today', color: 'primary' },
    { label: 'Em Andamento', value: 5, icon: 'play_circle', color: 'accent' },
    { label: 'Alunos Ativos', value: 76, icon: 'people', color: 'primary' },
    { label: 'Presentes Hoje', value: 23, icon: 'person', color: 'primary' },
    { label: 'Reposições Pendentes', value: 30, icon: 'refresh', color: 'warn' },
    { label: 'Ocupação Média', value: '95%', icon: 'bar_chart', color: 'primary' },
    { label: 'Frequência Hoje', value: '52%', icon: 'fact_check', color: 'accent' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardKpiCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardKpiCarouselComponent);
    component = fixture.componentInstance;
    component.items = mockItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders all KPI items in the track', () => {
    const slides = fixture.debugElement.queryAll(By.css('.kpi-carousel-slide'));
    expect(slides.length).toBe(7);
  });

  it('shows navigation dots for each item', () => {
    const dots = fixture.debugElement.queryAll(By.css('.kpi-dot'));
    expect(dots.length).toBe(7);
  });

  it('scrollNext increments scrollIndex', () => {
    component.scrollNext();
    expect(component.scrollIndex).toBe(1);
  });

  it('scrollPrev decrements scrollIndex', () => {
    component.scrollNext();
    component.scrollNext();
    expect(component.scrollIndex).toBe(2);
    component.scrollPrev();
    expect(component.scrollIndex).toBe(1);
  });

  it('does not scroll below 0', () => {
    component.scrollPrev();
    expect(component.scrollIndex).toBe(0);
  });

  it('does not scroll beyond last item', () => {
    component.scrollIndex = mockItems.length - 1;
    component.scrollNext();
    expect(component.scrollIndex).toBe(mockItems.length - 1);
  });

  it('canScrollPrev returns true when not at start', () => {
    component.scrollIndex = 2;
    expect(component.canScrollPrev).toBeTrue();
  });

  it('canScrollPrev returns false at start', () => {
    expect(component.canScrollPrev).toBeFalse();
  });

  it('canScrollNext returns true when not at end', () => {
    expect(component.canScrollNext).toBeTrue();
  });

  it('canScrollNext returns false at end', () => {
    component.scrollIndex = mockItems.length - 1;
    expect(component.canScrollNext).toBeFalse();
  });

  it('scrollTo sets correct index', () => {
    component.scrollTo(3);
    expect(component.scrollIndex).toBe(3);
  });

  it('shows next button with aria-label at start', () => {
    const nextBtn = fixture.debugElement.query(By.css('.kpi-nav-next'));
    expect(nextBtn).toBeTruthy();
    expect(nextBtn.attributes['aria-label']).toBe('Próximo');
  });

  it('shows prev button with aria-label after scrolling', () => {
    component.scrollNext();
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.query(By.css('.kpi-nav-prev'));
    expect(prevBtn).toBeTruthy();
    expect(prevBtn.attributes['aria-label']).toBe('Anterior');
  });
});
