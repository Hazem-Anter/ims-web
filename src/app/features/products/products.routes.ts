import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  { path: '', loadComponent: () => import('./products-list/products-list.component').then(m => m.ProductsListComponent) },
  { path: ':id/timeline', loadComponent: () => import('./product-timeline/product-timeline.component').then(m => m.ProductTimelineComponent) },
];
