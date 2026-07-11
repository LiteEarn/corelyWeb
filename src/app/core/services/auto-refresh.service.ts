import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, interval, fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AutoRefreshService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private refreshSource = new Subject<void>();

  refresh$: Observable<void> = this.refreshSource.asObservable();

  constructor() {
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshSource.next());

    fromEvent(document, 'visibilitychange')
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.refreshSource.next());
  }

  triggerRefresh(): void {
    this.refreshSource.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
