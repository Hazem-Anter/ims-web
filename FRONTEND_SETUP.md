# IMS Web Frontend

## Run
- Install deps: `npm install`
- Dev server: `npm start` (defaults to `http://localhost:4200`)
- Production build: `npm run build`

## API configuration
- Base URL lives in `src/environments/environment.ts` for local dev and `src/environments/environment.prod.ts` for production builds.
- Angular file replacement swaps in `environment.prod.ts` when building with `--configuration production`.
- All HTTP calls go through the centralized `ApiService`, which prefixes requests with `apiBaseUrl`. Update the value there to point at your backend (e.g. `http://localhost:8080`).

## Auth flow
- JWT-based auth stored in `localStorage`; refreshes keep the user signed in.
- `AuthInterceptor` adds `Authorization: Bearer <token>` to every request.
- `ErrorInterceptor` redirects to `/login` on `401` responses (except setup), mapping API errors to friendly messages.
- Route protection: `AuthGuard` blocks unauthenticated access; `RoleGuard` enforces role-based routes (e.g. `/users` for Admin).

## Features
- **Shell & navigation:** Collapsible sidebar, topbar with user info + logout, role-based menu visibility.
- **Products:** Search/filter with debounce, barcode lookup, timeline view, create/edit dialogs with validation, activate/deactivate with confirmation.
- **Warehouses & Locations:** CRUD dialogs with validation, active/inactive toggles with confirmation, per-warehouse locations management.
- **Inventory:** Receive/issue/transfer/adjust stock with lookup dropdowns and loading feedback; stock overview with low-stock filter.
- **Reports:** Stock movements (paged, date range, filters), low stock, dead stock, valuation; loading/error/empty states.
- **Dashboard:** KPI cards plus “Recent Movements” (latest 10) feed; refresh controls.
- **Users (Admin):** List, search, pagination, create user, manage roles/status/reset password via dialogs.

## UX utilities
- Shared loading spinner, empty-state, confirm dialog, form error helper, notification (snackbar) service, and error mapper are applied across pages for consistent feedback.
