import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const lessonTitle: ResolveFn<string> = (route) =>
  inject(ContentService).lesson(route.paramMap.get('lessonId') ?? '')?.title ??
  'Lição não encontrada';

export default [
  { path: '', pathMatch: 'full', redirectTo: '/' },
  {
    path: ':lessonId',
    title: lessonTitle,
    loadComponent: () => import('./lesson-page/lesson-page').then((m) => m.LessonPage),
  },
] satisfies Routes;
