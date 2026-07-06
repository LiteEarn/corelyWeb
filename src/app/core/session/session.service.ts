import { Injectable, signal, computed } from '@angular/core';
import { CurrentUser } from '../auth/auth.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private userSignal = signal<CurrentUser | null>(null);
  private loadingSignal = signal(false);

  readonly currentUser = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  readonly currentRole = computed(() => this.userSignal()?.role ?? '');

  readonly currentStudio = computed(() => this.userSignal()?.studio ?? null);

  readonly permissions = computed<string[]>(() => this.userSignal()?.permissions ?? []);

  readonly userName = computed(() => this.userSignal()?.name ?? '');

  readonly userEmail = computed(() => this.userSignal()?.email ?? '');

  setUser(user: CurrentUser): void {
    this.userSignal.set(user);
  }

  clear(): void {
    this.userSignal.set(null);
  }

  logout(): void {
    this.clear();
  }

  setLoading(value: boolean): void {
    this.loadingSignal.set(value);
  }
}
