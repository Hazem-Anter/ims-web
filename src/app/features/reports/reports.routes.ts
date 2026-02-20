import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  { path: '', loadComponent: () => import('./reports-page/reports-page.component').then(m => m.ReportsPageComponent) },
];
