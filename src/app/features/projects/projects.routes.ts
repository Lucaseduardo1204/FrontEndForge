import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const projectTitle: ResolveFn<string> = (route) =>
  inject(ContentService).catalog.projects.find((p) => p.id === route.paramMap.get('projectId'))
    ?.title ?? 'Projeto não encontrado';

export default [
  {
    path: '',
    title: 'Projetos',
    loadComponent: () => import('./projects-page/projects-page').then((m) => m.ProjectsPage),
  },
  {
    path: ':projectId',
    title: projectTitle,
    loadComponent: () => import('./project-page/project-page').then((m) => m.ProjectPage),
  },
] satisfies Routes;
