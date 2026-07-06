import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PermissionService, Role } from '../../core/rbac';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles: Role[];
}

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
export class SidebarComponent implements OnInit {
  @Input() isSidebarOpen = true;
  private permissionService = inject(PermissionService);

  allMenuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', roles: [Role.ADMIN, Role.OWNER] },
    { icon: 'school', label: 'Alunos', route: '/students', roles: [Role.ADMIN, Role.RECEPTIONIST] },
    { icon: 'person', label: 'Instrutores', route: '/instructors', roles: [Role.ADMIN] },
    { icon: 'groups', label: 'Turmas', route: '/class-groups', roles: [Role.ADMIN] },
    { icon: 'assignment_ind', label: 'Matrículas', route: '/enrollments', roles: [Role.ADMIN, Role.RECEPTIONIST] },
    { icon: 'fact_check', label: 'Presença', route: '/attendance', roles: [Role.ADMIN, Role.RECEPTIONIST, Role.INSTRUCTOR] },
    { icon: 'event', label: 'Agenda do Dia', route: '/daily-agenda', roles: [Role.ADMIN, Role.RECEPTIONIST, Role.INSTRUCTOR] },
    { icon: 'event_repeat', label: 'Reposições', route: '/makeup-approval', roles: [Role.ADMIN, Role.RECEPTIONIST] },
    { icon: 'flag', label: 'Objetivos', route: '/objectives', roles: [Role.INSTRUCTOR, Role.ADMIN] },
    { icon: 'assignment', label: 'Avaliações', route: '/evaluations', roles: [Role.INSTRUCTOR, Role.ADMIN] },
    { icon: 'timeline', label: 'Evoluções', route: '/evolutions', roles: [Role.INSTRUCTOR, Role.ADMIN] },
  ];

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.menuItems = this.allMenuItems.filter(item =>
      this.permissionService.hasAnyRole(item.roles)
    );
  }
}
