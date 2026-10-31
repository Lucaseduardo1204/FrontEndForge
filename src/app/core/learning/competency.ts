import { ContentCatalog, assessmentExerciseIds } from '../content/catalog';
import { Competency, ContentId, Exercise } from '../models/content.models';
import { IsoDateTime, Progress } from '../models/progress.models';
import { missionStatus } from '../progress/mission-status';
import { exerciseStatus, isCompleted } from '../progress/progress-updates';
import { ExerciseLocation, locate } from './next-activity';
import { attemptExerciseId, strugglingConcepts } from './performance';
import { dueReviews } from './spaced-repetition';

export const LEVEL_LABELS = [
  'Sem evidências',
  'Iniciando',
  'Praticando',
  'Consolidando',
  'Aplicando',
] as const;
export type CompetencyLevel = 0 | 1 | 2 | 3 | 4;

/** Share of correct answers needed in the recent window for level 3. */
export const CONSOLIDATION_ACCURACY = 0.7;

export interface LevelCriterion {
  readonly level: CompetencyLevel;
  readonly text: string;
  readonly met: boolean;
}

export interface CompetencyReport {
  readonly competency: Competency;
  /** Published exercises that train this competency. 0 → nothing to assess yet. */
  readonly exercisesAvailable: number;
  readonly level: CompetencyLevel;
  readonly evidence: {
    readonly solved: number;
    readonly independent: number;
    readonly assessmentsSolved: number;
    readonly assessmentsTotal: number;
    readonly recentAttempts: number;
    readonly recentAccuracy: number | null;
    readonly highestBox: number;
    readonly appliedIn: readonly string[];
    readonly lastActivity: {
      readonly title: string;
      readonly at: IsoDateTime;
      readonly correct: boolean;
    } | null;
  };
  /** Every level's criteria with whether it is met: the level is never a black box. */
  readonly criteria: readonly LevelCriterion[];
  readonly improvements: readonly string[];
  readonly nextActivities: readonly {
    readonly title: string;
    readonly reason: string;
    /** Set for exercises, so a lab link can point to the exercise itself. */
    readonly exerciseId?: string;
    readonly location:
      | ExerciseLocation
      | { readonly type: 'review' }
      | {
          readonly type: 'project';
          readonly projectId: string;
        };
  }[];
}

/**
 * Deterministic competency estimate from recorded evidence (see LEVEL rules in the criteria).
 * Retention uses the *current* Leitner box, so forgetting a concept lowers the level.
 */
export function competencyReport(
  catalog: ContentCatalog,
  progress: Progress,
  competency: Competency,
  now: Date,
): CompetencyReport {
  const conceptIds = new Set(
    catalog.concepts.filter((c) => c.competencyId === competency.id).map((c) => c.id),
  );
  const exercises = catalog.exercises.filter((e) => e.conceptIds.some((id) => conceptIds.has(id)));
  const exerciseIds = new Set(exercises.map((e) => e.id));
  const title = (id: ContentId) => catalog.exercises.find((e) => e.id === id)?.title ?? id;

  // Exercises and how they were solved.
  const solvedExercises = exercises.filter((e) => exerciseStatus(progress, e.id).solved);
  const independent = solvedExercises.filter((e) => solvedIndependently(progress, e.id)).length;
  const assessmentIds = new Set(catalog.lessons.flatMap(assessmentExerciseIds));
  const assessments = exercises.filter((e) => assessmentIds.has(e.id));

  // Recent accuracy on this competency (practice and reviews).
  const relevant = progress.attempts.filter((a) => {
    const id = attemptExerciseId(a);
    return id !== undefined && exerciseIds.has(id);
  });
  const recent = relevant.slice(-10);
  const recentAccuracy = recent.length
    ? recent.filter((a) => a.correct).length / recent.length
    : null;
  const last = relevant.at(-1);

  // Retention and application.
  const highestBox = Math.max(
    0,
    ...Object.values(progress.reviews)
      .filter((card) => conceptIds.has(card.conceptId))
      .map((card) => card.box),
  );
  const appliedIn = [
    ...catalog.projects
      .filter(
        (p) => p.competencyIds.includes(competency.id) && isCompleted(progress, 'project', p.id),
      )
      .map((p) => `Projeto: ${p.title}`),
    ...catalog.missions
      .filter(
        (m) =>
          m.conceptIds.some((id) => conceptIds.has(id)) && missionStatus(m, progress).completedAt,
      )
      .map((m) => `Missão: ${m.title}`),
  ];

  const practiceTarget = Math.min(3, exercises.length);
  const criteria: LevelCriterion[] = [
    { level: 1, text: 'Acertou ao menos 1 exercício', met: solvedExercises.length >= 1 },
    {
      level: 2,
      text: `Resolveu ${practiceTarget} ${practiceTarget === 1 ? 'exercício' : 'exercícios'} (${solvedExercises.length} até agora)`,
      met: exercises.length > 0 && solvedExercises.length >= practiceTarget,
    },
    {
      level: 2,
      text: 'Resolveu ao menos 1 sem dicas e sem pedir a solução',
      met: independent >= 1,
    },
    {
      level: 3,
      text: 'Um conceito chegou à caixa 3 da revisão espaçada (lembrou em duas revisões seguidas)',
      met: highestBox >= 3,
    },
    {
      level: 3,
      text: `Acertou ao menos ${CONSOLIDATION_ACCURACY * 100}% das últimas tentativas desta competência`,
      met: recentAccuracy !== null && recentAccuracy >= CONSOLIDATION_ACCURACY,
    },
    {
      level: 4,
      text: 'Usou a competência em um projeto ou missão concluídos',
      met: appliedIn.length > 0,
    },
  ];

  let level: CompetencyLevel = 0;
  for (const candidate of [1, 2, 3, 4] as const) {
    if (criteria.filter((c) => c.level <= candidate).every((c) => c.met)) level = candidate;
    else break;
  }

  return {
    competency,
    exercisesAvailable: exercises.length,
    level,
    evidence: {
      solved: solvedExercises.length,
      independent,
      assessmentsSolved: assessments.filter((e) => exerciseStatus(progress, e.id).solved).length,
      assessmentsTotal: assessments.length,
      recentAttempts: recent.length,
      recentAccuracy,
      highestBox,
      appliedIn,
      lastActivity: last
        ? { title: title(attemptExerciseId(last)!), at: last.submittedAt, correct: last.correct }
        : null,
    },
    criteria,
    improvements: improvements(catalog, progress, conceptIds, now),
    nextActivities: nextActivities(catalog, progress, competency, exercises, conceptIds, now),
  };
}

/** First correct attempt without hints and without requesting the solution. */
function solvedIndependently(progress: Progress, exerciseId: string): boolean {
  const first = progress.attempts.find(
    (a) => a.activityType === 'exercise' && a.activityId === exerciseId && a.correct,
  );
  return first !== undefined && first.hintsUsed === 0 && !first.solutionViewed;
}

function improvements(
  catalog: ContentCatalog,
  progress: Progress,
  conceptIds: Set<string>,
  now: Date,
): string[] {
  const conceptTitle = (id: string) => catalog.concepts.find((c) => c.id === id)?.title ?? id;
  return [
    ...strugglingConcepts(catalog, progress)
      .filter((c) => conceptIds.has(c.conceptId))
      .map(
        (c) =>
          `Erros recorrentes em “${c.title}”: ${c.errors} das últimas ${c.attempts} tentativas.`,
      ),
    ...dueReviews(progress, now)
      .filter((d) => conceptIds.has(d.card.conceptId))
      .map((d) => `Revisão vencida de “${conceptTitle(d.card.conceptId)}”.`),
  ];
}

function nextActivities(
  catalog: ContentCatalog,
  progress: Progress,
  competency: Competency,
  exercises: readonly Exercise[],
  conceptIds: Set<string>,
  now: Date,
): CompetencyReport['nextActivities'] {
  const result: CompetencyReport['nextActivities'][number][] = [];
  if (dueReviews(progress, now).some((d) => conceptIds.has(d.card.conceptId))) {
    result.push({
      title: 'Fazer as revisões vencidas',
      reason: 'Há conceitos desta competência com revisão vencida.',
      location: { type: 'review' },
    });
  }
  for (const exercise of exercises
    .filter((e) => !exerciseStatus(progress, e.id).solved)
    .slice(0, 2)) {
    result.push({
      title: exercise.title,
      reason: 'Exercício desta competência ainda não resolvido.',
      exerciseId: exercise.id,
      location: locate(catalog, exercise),
    });
  }
  const project = catalog.projects.find(
    (p) => p.competencyIds.includes(competency.id) && !isCompleted(progress, 'project', p.id),
  );
  if (project) {
    result.push({
      title: project.title,
      reason: 'Projeto que aplica esta competência.',
      location: { type: 'project', projectId: project.id },
    });
  }
  return result.slice(0, 3);
}
