import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { of, Subject } from 'rxjs';
import { ResponsiveService } from './responsive.service';
import { LayoutMode } from './layout-mode.enum';

describe('ResponsiveService', () => {
  let service: ResponsiveService;
  let breakpointObserverMock: jasmine.SpyObj<BreakpointObserver>;
  let breakpointSubject: Subject<BreakpointState>;

  function createState(matches: boolean): BreakpointState {
    return { matches, breakpoints: {} };
  }

  beforeEach(() => {
    breakpointSubject = new Subject<BreakpointState>();

    breakpointObserverMock = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverMock.observe.and.returnValue(breakpointSubject.asObservable());

    TestBed.configureTestingModule({
      providers: [
        ResponsiveService,
        { provide: BreakpointObserver, useValue: breakpointObserverMock }
      ]
    });

    service = TestBed.inject(ResponsiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default values as false', () => {
    expect(service.isMobile()).toBeFalse();
    expect(service.isTablet()).toBeFalse();
    expect(service.isDesktop()).toBeFalse();
    expect(service.isPortrait()).toBeFalse();
    expect(service.isHandset()).toBeFalse();
  });

  it('should detect mobile layout mode', () => {
    breakpointSubject.next(createState(true));
    expect(service.isMobile()).toBeTrue();
    expect(service.layoutMode()).toBe(LayoutMode.MOBILE);
  });

  it('should detect tablet layout mode when mobile is false and tablet observe returns true', () => {
    breakpointSubject.next(createState(false));
    expect(service.isMobile()).toBeFalse();
  });

  it('should compute screenSize as mobile', () => {
    breakpointSubject.next(createState(true));
    expect(service.screenSize()).toBe('mobile');
  });

  it('should compute screenSize as desktop when desktopXL is false', () => {
    breakpointSubject.next(createState(false));
    expect(service.screenSize()).toBe('unknown');
  });

  it('should compute isHandsetPortrait correctly', () => {
    expect(service.isHandsetPortrait()).toBeFalse();
  });
});
