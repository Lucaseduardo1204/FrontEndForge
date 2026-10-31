import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Revisões',
    loadComponent: () => import('./review-page/review-page').then((m) => m.ReviewPage),
  },
] satisfies Routes;
