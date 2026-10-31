import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const bugTitle: ResolveFn<string> = (route) =>
  inject(ContentService).catalog.bugs.find((b) => b.id === route.paramMap.get('bugId'))?.title ??
  'Bug não encontrado';

export default [
  {
    path: '',
    title: 'Bestiário de bugs',
    loadComponent: () => import('./bugs-page/bugs-page').then((m) => m.BugsPage),
  },
  {
    path: ':bugId',
    title: bugTitle,
    loadComponent: () => import('./bug-page/bug-page').then((m) => m.BugPage),
  },
] satisfies Routes;
