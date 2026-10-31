import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

/** Every feature is lazy loaded through its own `<feature>.routes.ts`. */
export const routes: Routes = [
  // Focus mode has its own minimal layout (no sidebar), so it sits outside the shell.
  { path: 'focus', loadChildren: () => import('./features/focus/focus.routes') },
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./features/dashboard/dashboard.routes'),
      },
      {
        path: 'achievements',
        loadChildren: () => import('./features/achievements/achievements.routes'),
      },
      { path: 'review', loadChildren: () => import('./features/review/review.routes') },
      { path: 'lessons', loadChildren: () => import('./features/lessons/lessons.routes') },
      { path: 'academy', loadChildren: () => import('./features/academy/academy.routes') },
      { path: 'lab', loadChildren: () => import('./features/lab/lab.routes') },
      { path: 'missions', loadChildren: () => import('./features/missions/missions.routes') },
      { path: 'projects', loadChildren: () => import('./features/projects/projects.routes') },
      { path: 'bugs', loadChildren: () => import('./features/bugs/bugs.routes') },
      { path: 'library', loadChildren: () => import('./features/library/library.routes') },
      { path: 'profile', loadChildren: () => import('./features/profile/profile.routes') },
      { path: 'settings', loadChildren: () => import('./features/settings/settings.routes') },
      {
        path: '**',
        title: 'Página não encontrada',
        loadComponent: () =>
          import('./shared/ui/not-found-page/not-found-page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
