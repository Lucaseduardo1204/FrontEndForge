import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Configurações',
    loadComponent: () => import('./settings-page/settings-page').then((m) => m.SettingsPage),
  },
] satisfies Routes;
