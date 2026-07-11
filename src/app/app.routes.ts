import { Routes } from '@angular/router';
import { ShellComponent } from './layout';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/rbac/role.guard';
import { Role } from './core/rbac/role.enum';
import { ROUTE_PERMISSIONS } from './core/rbac/permission-matrix';
import {
  DashboardComponent,
  StudentsComponent,
  StudentFormComponent,
  StudentDetailsComponent,
  InstructorsListComponent,
  InstructorFormComponent,
  InstructorDetailsComponent,
  ClassGroupsComponent,
  ClassGroupFormComponent,
  EnrollmentsComponent,
  EnrollmentFormComponent,
  AttendanceComponent,
  SessionsComponent,
  SessionFormComponent,
  ObjectivesComponent,
  ObjectiveFormComponent,
  ObjectiveDetailsComponent,
  EvaluationsComponent,
  EvaluationFormComponent,
  EvolutionsComponent,
  EvolutionFormComponent,
  DailyAgendaComponent,
  MakeupApprovalComponent,
  PlansComponent,
  PlanFormComponent,
} from './pages';

function getRoles(path: string): Role[] {
  const route = ROUTE_PERMISSIONS.find(r => r.path === path);
  return route?.roles ?? [];
}

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: getRoles('dashboard') } },
      { path: 'students', component: StudentsComponent, canActivate: [roleGuard], data: { roles: getRoles('students') } },
      { path: 'students/new', component: StudentFormComponent, canActivate: [roleGuard], data: { roles: getRoles('students/new') } },
      { path: 'students/:id', component: StudentDetailsComponent, canActivate: [roleGuard], data: { roles: getRoles('students/:id') } },
      { path: 'students/:id/edit', component: StudentFormComponent, canActivate: [roleGuard], data: { roles: getRoles('students/:id/edit') } },
      { path: 'instructors', component: InstructorsListComponent, canActivate: [roleGuard], data: { roles: getRoles('instructors') } },
      { path: 'instructors/new', component: InstructorFormComponent, canActivate: [roleGuard], data: { roles: getRoles('instructors/new') } },
      { path: 'instructors/:id', component: InstructorDetailsComponent, canActivate: [roleGuard], data: { roles: getRoles('instructors/:id') } },
      { path: 'instructors/:id/edit', component: InstructorFormComponent, canActivate: [roleGuard], data: { roles: getRoles('instructors/:id/edit') } },
      { path: 'class-groups', component: ClassGroupsComponent, canActivate: [roleGuard], data: { roles: getRoles('class-groups') } },
      { path: 'class-groups/new', component: ClassGroupFormComponent, canActivate: [roleGuard], data: { roles: getRoles('class-groups/new') } },
      { path: 'class-groups/:id', component: ClassGroupFormComponent, canActivate: [roleGuard], data: { roles: getRoles('class-groups/:id') } },
      { path: 'class-groups/:id/edit', component: ClassGroupFormComponent, canActivate: [roleGuard], data: { roles: getRoles('class-groups/:id/edit') } },
      { path: 'enrollments', component: EnrollmentsComponent, canActivate: [roleGuard], data: { roles: getRoles('enrollments') } },
      { path: 'enrollments/new', component: EnrollmentFormComponent, canActivate: [roleGuard], data: { roles: getRoles('enrollments/new') } },
      { path: 'enrollments/:id/edit', component: EnrollmentFormComponent, canActivate: [roleGuard], data: { roles: getRoles('enrollments/:id/edit') } },
      { path: 'attendance', component: AttendanceComponent, canActivate: [roleGuard], data: { roles: getRoles('attendance') } },
      { path: 'daily-agenda', component: DailyAgendaComponent, canActivate: [roleGuard], data: { roles: getRoles('daily-agenda') } },
      { path: 'sessions', component: SessionsComponent, canActivate: [roleGuard], data: { roles: getRoles('sessions') } },
      { path: 'sessions/new', component: SessionFormComponent, canActivate: [roleGuard], data: { roles: getRoles('sessions/new') } },
      { path: 'sessions/:id/edit', component: SessionFormComponent, canActivate: [roleGuard], data: { roles: getRoles('sessions/:id/edit') } },
      { path: 'makeup-approval', component: MakeupApprovalComponent, canActivate: [roleGuard], data: { roles: getRoles('makeup-approval') } },
      { path: 'objectives', component: ObjectivesComponent, canActivate: [roleGuard], data: { roles: getRoles('objectives') } },
      { path: 'objectives/new', component: ObjectiveFormComponent, canActivate: [roleGuard], data: { roles: getRoles('objectives/new') } },
      { path: 'objectives/:id', component: ObjectiveDetailsComponent, canActivate: [roleGuard], data: { roles: getRoles('objectives/:id') } },
      { path: 'objectives/:id/edit', component: ObjectiveFormComponent, canActivate: [roleGuard], data: { roles: getRoles('objectives/:id/edit') } },
      { path: 'evaluations', component: EvaluationsComponent, canActivate: [roleGuard], data: { roles: getRoles('evaluations') } },
      { path: 'evaluations/new', component: EvaluationFormComponent, canActivate: [roleGuard], data: { roles: getRoles('evaluations/new') } },
      { path: 'evaluations/:id/edit', component: EvaluationFormComponent, canActivate: [roleGuard], data: { roles: getRoles('evaluations/:id/edit') } },
      { path: 'evolutions', component: EvolutionsComponent, canActivate: [roleGuard], data: { roles: getRoles('evolutions') } },
      { path: 'evolutions/new', component: EvolutionFormComponent, canActivate: [roleGuard], data: { roles: getRoles('evolutions/new') } },
      { path: 'evolutions/:id/edit', component: EvolutionFormComponent, canActivate: [roleGuard], data: { roles: getRoles('evolutions/:id/edit') } },
      { path: 'plans', component: PlansComponent, canActivate: [roleGuard], data: { roles: getRoles('plans') } },
      { path: 'plans/new', component: PlanFormComponent, canActivate: [roleGuard], data: { roles: getRoles('plans/new') } },
      { path: 'plans/:id/edit', component: PlanFormComponent, canActivate: [roleGuard], data: { roles: getRoles('plans/:id/edit') } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
