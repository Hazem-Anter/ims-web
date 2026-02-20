import { Routes } from '@angular/router';

export const warehousesRoutes: Routes = [
  { path: '', loadComponent: () => import('./warehouses-list/warehouses-list.component').then(m => m.WarehousesListComponent) },
  { path: ':id/locations', loadComponent: () => import('./locations-list/locations-list.component').then(m => m.LocationsListComponent) },
];
