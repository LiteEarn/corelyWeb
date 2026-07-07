import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface QuickAction {
  label: string;
  icon: string;
  action: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss',
})
export class QuickActionsComponent {
  @Output() actionClick = new EventEmitter<string>();

  actions: QuickAction[] = [
    { label: 'Nova Presença', icon: 'how_to_reg', action: 'attendance', color: '#0F766E', description: 'Registrar presença' },
    { label: 'Nova Matrícula', icon: 'person_add', action: 'enrollment', color: '#2563eb', description: 'Adicionar matrícula' },
    { label: 'Novo Aluno', icon: 'person_add_alt', action: 'student', color: '#7c3aed', description: 'Cadastrar aluno' },
    { label: 'Agenda', icon: 'calendar_today', action: 'agenda', color: '#d97706', description: 'Ver agenda' },
  ];

  handleAction(action: string): void {
    this.actionClick.emit(action);
  }
}
