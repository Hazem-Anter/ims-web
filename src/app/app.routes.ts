import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';

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
      { path: 'products', loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes) },
      { path: 'warehouses', loadChildren: () => import('./features/warehouses/warehouses.routes').then(m => m.warehousesRoutes) },
      { path: 'inventory', loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.inventoryRoutes) },
      { path: 'reports', loadChildren: () => import('./features/reports/reports.routes').then(m => m.reportsRoutes) },
      {
        path: 'users',
        canMatch: [RoleGuard],
        data: { roles: ['Admin'] },
        loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes)
      },
    ]
  },

  { path: '**', redirectTo: '' }
];
