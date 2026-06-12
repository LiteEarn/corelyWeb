import { Routes } from '@angular/router';
import { ShellComponent } from './layout';
import { DashboardComponent, StudentsComponent, ObjectivesComponent, EvaluationsComponent, EvolutionsComponent } from './pages';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'goals', component: ObjectivesComponent },
      { path: 'assessments', component: EvaluationsComponent },
      { path: 'evolutions', component: EvolutionsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
