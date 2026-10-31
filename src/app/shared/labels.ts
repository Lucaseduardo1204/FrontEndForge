import { Difficulty, LessonStepKind } from '../core/models/content.models';

export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  introductory: 'Introdutório',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export const STEP_KIND_LABELS: Readonly<Record<LessonStepKind, string>> = {
  context: 'Contexto',
  intuition: 'Intuição',
  explanation: 'Explicação técnica',
  'guided-code': 'Código guiado',
  experiment: 'Experimentação',
  practice: 'Prática',
  debugging: 'Depuração',
  'real-world': 'Aplicação real',
  assessment: 'Avaliação',
  review: 'Revisão',
};
