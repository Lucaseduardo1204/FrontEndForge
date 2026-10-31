import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { ContentService } from '../../core/content/content.service';

const missionTitle: ResolveFn<string> = (route) =>
  inject(ContentService).catalog.missions.find((m) => m.id === route.paramMap.get('missionId'))
    ?.title ?? 'Missão não encontrada';

export default [
  {
    path: '',
    title: 'Missões',
    loadComponent: () => import('./missions-page/missions-page').then((m) => m.MissionsPage),
  },
  {
    path: ':missionId',
    title: missionTitle,
    loadComponent: () => import('./mission-page/mission-page').then((m) => m.MissionPage),
  },
] satisfies Routes;
