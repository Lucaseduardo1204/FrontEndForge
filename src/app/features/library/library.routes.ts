import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const entryTitle: ResolveFn<string> = (route) =>
  inject(ContentService).catalog.library.find((e) => e.id === route.paramMap.get('entryId'))
    ?.title ?? 'Entrada não encontrada';

export default [
  {
    path: '',
    title: 'Biblioteca técnica',
    loadComponent: () => import('./library-page/library-page').then((m) => m.LibraryPage),
  },
  {
    path: ':entryId',
    title: entryTitle,
    loadComponent: () =>
      import('./library-entry-page/library-entry-page').then((m) => m.LibraryEntryPage),
  },
] satisfies Routes;
