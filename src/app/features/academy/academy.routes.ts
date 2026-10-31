import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const phaseTitle: ResolveFn<string> = (route) => {
  const phase = inject(ContentService).catalog.phases.find(
    (p) => p.id === route.paramMap.get('phaseId'),
  );
  return phase ? `Fase ${phase.order}: ${phase.title}` : 'Fase não encontrada';
};

export default [
  {
    path: '',
    title: 'Academia',
    loadComponent: () => import('./academy-page/academy-page').then((m) => m.AcademyPage),
  },
  { path: 'phases', pathMatch: 'full', redirectTo: '/academy' },
  {
    path: 'phases/:phaseId',
    title: phaseTitle,
    loadComponent: () => import('./phase-page/phase-page').then((m) => m.PhasePage),
  },
] satisfies Routes;
