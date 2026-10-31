import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./focus-layout/focus-layout').then((m) => m.FocusLayout),
    children: [
      {
        path: '',
        title: 'Modo foco',
        loadComponent: () => import('./focus-page/focus-page').then((m) => m.FocusPage),
      },
      {
        path: 'summary/:sessionId',
        title: 'Resumo da sessão',
        loadComponent: () => import('./focus-summary/focus-summary').then((m) => m.FocusSummary),
      },
    ],
  },
] satisfies Routes;
