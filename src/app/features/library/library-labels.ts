import { LibraryKind, LibraryTechnology, RelatedLink } from '../../core/models/content.models';

export const KIND_LABELS: Readonly<Record<LibraryKind, string>> = {
  concept: 'Conceito',
  comparison: 'Comparação',
  glossary: 'Glossário',
  shortcuts: 'Atalhos',
  pattern: 'Padrão',
  practice: 'Boa prática',
};

export const TECHNOLOGY_LABELS: Readonly<Record<LibraryTechnology, string>> = {
  web: 'Web',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  angular: 'Angular',
  security: 'Segurança',
  accessibility: 'Acessibilidade',
  tools: 'Ferramentas',
};

export const RELATED_LABELS: Readonly<Record<RelatedLink['type'], string>> = {
  lesson: 'Lição',
  lab: 'Laboratório',
  mission: 'Missão',
  bug: 'Bestiário',
  project: 'Projeto',
};

export const RELATED_ROUTES: Readonly<Record<RelatedLink['type'], string>> = {
  lesson: '/lessons',
  lab: '/lab',
  mission: '/missions',
  bug: '/bugs',
  project: '/projects',
};
