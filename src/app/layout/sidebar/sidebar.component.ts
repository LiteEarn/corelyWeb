import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isSidebarOpen = true;

  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'school', label: 'Alunos', route: '/students' },
    { icon: 'person', label: 'Instrutores', route: '/instructors' },
    { icon: 'groups', label: 'Turmas', route: '/class-groups' },
    { icon: 'assignment_ind', label: 'Matrículas', route: '/enrollments' },
    { icon: 'fact_check', label: 'Presença', route: '/attendance' },
    { icon: 'event', label: 'Agenda', route: '/sessions' },
    { icon: 'flag', label: 'Objetivos', route: '/objectives' },
    { icon: 'assignment', label: 'Avaliações', route: '/assessments' },
    { icon: 'trending_up', label: 'Evoluções', route: '/evolutions' },
  ];
}
