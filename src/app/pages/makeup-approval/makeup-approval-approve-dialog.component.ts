import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DsButtonComponent } from '../../shared/design-system/button/button.component';
import { PermissionService } from '../../core/rbac/permission.service';
import { SessionService } from '../../features/sessions/session.service';
import { Session } from '../../features/sessions/session.model';

@Component({
  selector: 'app-makeup-approval-approve-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    DsButtonComponent,
  ],
  template: `
    <h2 mat-dialog-title>Aprovar Reposição</h2>
    <mat-dialog-content>
      <p class="dialog-description">Selecione a aula futura para a reposição.</p>

      <div *ngIf="loadingSessions" class="loading-sessions">
        <mat-spinner diameter="20"></mat-spinner>
        <span>Carregando aulas disponíveis...</span>
      </div>

      <div *ngIf="!loadingSessions && sessions.length === 0" class="no-sessions">
        Nenhuma aula futura disponível.
      </div>

      <mat-form-field appearance="outline" class="session-select" *ngIf="!loadingSessions && sessions.length > 0">
        <mat-label>Aula</mat-label>
        <mat-select [(ngModel)]="selectedSessionId">
          <mat-option *ngFor="let s of sessions" [value]="s.id">
            {{ s.title }} - {{ s.scheduledDate }} {{ s.startTime }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="saving">Cancelar</button>
      <ds-button
        label="Confirmar"
        variant="primary"
        [disabled]="!selectedSessionId"
        [loading]="saving"
        (click)="onConfirm()"
      ></ds-button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-description {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 16px;
    }
    .loading-sessions {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 0;
      color: #64748b;
      font-size: 14px;
    }
    .no-sessions {
      padding: 24px 0;
      color: #94a3b8;
      font-size: 14px;
      text-align: center;
    }
    .session-select {
      width: 100%;
    }
  `],
})
export class MakeupApprovalApproveDialogComponent implements OnInit, OnDestroy {
  sessions: Session[] = [];
  selectedSessionId: string = '';
  loadingSessions = false;
  saving = false;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<MakeupApprovalApproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { makeupRequestId: string },
    private sessionService: SessionService,
    private permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    if (this.permissionService.hasPermission('MAKEUP_REQUEST_WRITE')) {
      this.loadSessions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSessions(): void {
    this.loadingSessions = true;

    this.sessionService.getAll({ status: 'SCHEDULED' }).pipe(
      takeUntil(this.destroy$),
      catchError(() => {
        this.loadingSessions = false;
        return of([]);
      }),
    ).subscribe((sessions) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.sessions = (sessions || []).filter((s) => {
        if (!s.scheduledDate) return false;
        const sessionDate = new Date(s.scheduledDate + 'T00:00:00');
        return sessionDate >= today;
      });

      this.loadingSessions = false;
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    if (!this.selectedSessionId || this.saving) return;

    this.saving = true;
    this.dialogRef.close({ sessionId: this.selectedSessionId });
  }
}
