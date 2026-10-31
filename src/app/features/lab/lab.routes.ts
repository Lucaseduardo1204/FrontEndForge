import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const exerciseTitle: ResolveFn<string> = (route) => {
  const exercise = inject(ContentService).exercise(route.paramMap.get('exerciseId') ?? '');
  return exercise?.kind === 'code' ? `${exercise.title} · Laboratório` : 'Exercício não encontrado';
};

export default [
  {
    path: '',
    title: 'Laboratório',
    loadComponent: () => import('./lab-page/lab-page').then((m) => m.LabPage),
  },
  {
    path: ':exerciseId',
    title: exerciseTitle,
    loadComponent: () =>
      import('./lab-exercise-page/lab-exercise-page').then((m) => m.LabExercisePage),
  },
] satisfies Routes;
