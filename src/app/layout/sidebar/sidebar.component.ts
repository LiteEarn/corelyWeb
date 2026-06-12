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
    { icon: 'flag', label: 'Objetivos', route: '/goals' },
    { icon: 'assignment', label: 'Avaliações', route: '/assessments' },
    { icon: 'trending_up', label: 'Evoluções', route: '/evolutions' },
  ];
}
