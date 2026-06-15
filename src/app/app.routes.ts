import { Routes } from '@angular/router';
import { ShellComponent } from './layout';
<<<<<<< HEAD
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
=======
import { DashboardComponent, StudentsComponent, StudentFormComponent, StudentDetailsComponent, ObjectivesComponent, EvaluationsComponent, EvolutionsComponent } from './pages';
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8

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
<<<<<<< HEAD
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
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
      { path: 'goals', component: ObjectivesComponent },
      { path: 'assessments', component: EvaluationsComponent },
      { path: 'evolutions', component: EvolutionsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
