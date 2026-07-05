import { Injectable, signal, computed } from '@angular/core';
import { CurrentUser } from '../auth/auth.models';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private currentUserSignal = signal<CurrentUser | null>(null);
  private loadingSignal = signal(true);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly currentStudio = computed(() => this.currentUserSignal()?.studio ?? null);
  readonly currentRole = computed(() => this.currentUserSignal()?.role ?? null);
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly permissions = computed(() => this.currentUserSignal()?.permissions ?? []);

  setUser(user: CurrentUser): void {
    this.currentUserSignal.set(user);
  }

  clear(): void {
    this.currentUserSignal.set(null);
  }

  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }
}
