import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Conquistas e XP',
    loadComponent: () =>
      import('./achievements-page/achievements-page').then((m) => m.AchievementsPage),
  },
] satisfies Routes;
