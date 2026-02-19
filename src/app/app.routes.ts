import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'setup', loadComponent: () => import('./features/setup/setup.component').then(m => m.SetupComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },

  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./core/layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    ]
  },

  { path: '**', redirectTo: '' }
];
