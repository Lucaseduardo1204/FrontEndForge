import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Central de comando',
    loadComponent: () => import('./dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
] satisfies Routes;
