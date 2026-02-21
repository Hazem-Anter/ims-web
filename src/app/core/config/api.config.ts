import { environment } from '../../../environments/environment';

export const API_BASE = environment.apiBaseUrl;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    me: '/api/auth/me',
    setup: '/api/setup/initialize'
  },
  dashboard: {
    summary: '/api/dashboard/summary'
  },
  products: '/api/products',
  lookups: {
    products: '/api/lookups/products',
    warehouses: '/api/lookups/warehouses'
  },
  warehouses: '/api/warehouses',
  inventory: {
    overview: '/api/inventory/stock-overview',
    receive: '/api/inventory/receive',
    issue: '/api/inventory/issue',
    transfer: '/api/inventory/transfer',
    adjust: '/api/inventory/adjust'
  },
  reports: {
    stockMovements: '/api/reports/stock-movements',
    lowStock: '/api/reports/low-stock',
    deadStock: '/api/reports/dead-stock',
    stockValuation: '/api/reports/stock-valuation'
  },
  admin: {
    users: '/api/admin/users',
    roles: '/api/admin/roles'
  }
} as const;
