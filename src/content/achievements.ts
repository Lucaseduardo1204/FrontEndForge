import { Achievement } from '../app/core/models/content.models';

/**
 * Achievements. Every criterion is public and deterministic: no hidden or random rewards.
 * Each id needs a rule in `core/gamification/achievement-rules.ts` (checked by tests).
 * Once unlocked, an achievement is never taken back: it is derived from the history.
 */
export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first-correct-answer',
    title: 'Primeira resposta certa',
    description: 'O começo de tudo.',
    criteria: 'Acerte um exercício pela primeira vez.',
  },
  {
    id: 'first-lesson',
    title: 'Primeira lição concluída',
    description: 'Do contexto à avaliação, uma lição inteira.',
    criteria: 'Conclua uma lição, incluindo a avaliação.',
  },
  {
    id: 'first-project',
    title: 'Primeiro projeto concluído',
    description: 'Do briefing à rubrica, um projeto inteiro.',
    criteria:
      'Conclua um projeto: verificação automática passando, checklist completo e autoavaliação preenchida.',
  },
  {
    id: 'first-mission',
    title: 'Primeira missão cumprida',
    description: 'Um problema real, diagnosticado e resolvido.',
    criteria: 'Resolva todas as tarefas de uma missão.',
  },
  {
    id: 'first-bug-diagnosed',
    title: 'Primeiro bug diagnosticado',
    description: 'Entender por que algo quebra é metade da correção.',
    criteria:
      'Acerte um diagnóstico do bestiário de bugs ou um exercício de uma etapa de depuração.',
  },
  {
    id: 'learned-from-mistakes',
    title: 'Aprendeu com o erro',
    description: 'Errar, entender e acertar: é assim que se aprende.',
    criteria: 'Acerte um exercício em que você tinha errado pelo menos duas vezes antes.',
  },
  {
    id: 'first-code-passed',
    title: 'Primeiro código aprovado',
    description: 'Seu código rodou e passou em todos os testes.',
    criteria: 'Passe em todos os testes de um exercício do laboratório.',
  },
  {
    id: 'code-first-try',
    title: 'De primeira',
    description: 'Resolvido com as próprias mãos, sem pedir a solução.',
    criteria:
      'Passe em todos os testes de um exercício do laboratório na primeira execução, sem ter pedido a solução antes.',
  },
  {
    id: 'first-review',
    title: 'Memória em treino',
    description: 'A primeira revisão espaçada.',
    criteria: 'Faça uma revisão de conceito, acertando ou não.',
  },
  {
    id: 'long-term-memory',
    title: 'Memória de longo prazo',
    description: 'Um conceito lembrado em intervalos cada vez maiores.',
    criteria: 'Leve um conceito até a caixa 5 da revisão espaçada.',
  },
  {
    id: 'three-day-streak',
    title: 'Três dias seguidos',
    description: 'Consistência vale mais que maratona.',
    criteria: 'Estude em 3 dias consecutivos (em qualquer momento do histórico).',
  },
  {
    id: 'seven-day-streak',
    title: 'Uma semana seguida',
    description: 'Estudar vira hábito.',
    criteria: 'Estude em 7 dias consecutivos (em qualquer momento do histórico).',
  },
];
