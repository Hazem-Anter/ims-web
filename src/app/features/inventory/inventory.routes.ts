import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./transactions/transactions.component').then(m => m.TransactionsComponent) },
  { path: 'overview', loadComponent: () => import('./stock-overview/stock-overview.component').then(m => m.StockOverviewComponent) },
];
