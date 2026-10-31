import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const competencyTitle: ResolveFn<string> = (route) =>
  inject(ContentService).catalog.competencies.find(
    (c) => c.id === route.paramMap.get('competencyId'),
  )?.title ?? 'Competência não encontrada';

export default [
  {
    path: '',
    title: 'Competências',
    loadComponent: () => import('./profile-page/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: ':competencyId',
    title: competencyTitle,
    loadComponent: () => import('./competency-page/competency-page').then((m) => m.CompetencyPage),
  },
] satisfies Routes;
