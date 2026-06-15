import { Routes } from '@angular/router';
import { ShellComponent } from './layout';
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
  EvaluationsComponent,
  EvolutionsComponent
} from './pages';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'students/new', component: StudentFormComponent },
      { path: 'students/:id', component: StudentDetailsComponent },
      { path: 'students/:id/edit', component: StudentFormComponent },
      { path: 'instructors', component: InstructorsListComponent },
      { path: 'instructors/new', component: InstructorFormComponent },
      { path: 'instructors/:id', component: InstructorDetailsComponent },
      { path: 'instructors/:id/edit', component: InstructorFormComponent },
      { path: 'class-groups', component: ClassGroupsComponent },
      { path: 'class-groups/new', component: ClassGroupFormComponent },
      { path: 'class-groups/:id', component: ClassGroupFormComponent },
      { path: 'class-groups/:id/edit', component: ClassGroupFormComponent },
      { path: 'enrollments', component: EnrollmentsComponent },
      { path: 'enrollments/new', component: EnrollmentFormComponent },
      { path: 'enrollments/:id/edit', component: EnrollmentFormComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'sessions', component: SessionsComponent },
      { path: 'sessions/new', component: SessionFormComponent },
      { path: 'sessions/:id/edit', component: SessionFormComponent },
      { path: 'goals', component: ObjectivesComponent },
      { path: 'assessments', component: EvaluationsComponent },
      { path: 'evolutions', component: EvolutionsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
