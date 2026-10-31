import { BugEntry } from '../../core/models/content.models';

export const TECHNOLOGY_LABELS: Readonly<Record<BugEntry['technology'], string>> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  angular: 'Angular',
};
