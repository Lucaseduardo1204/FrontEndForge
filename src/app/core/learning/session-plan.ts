import { ContentCatalog } from '../content/catalog';
import { achievementStates } from '../gamification/achievement-rules';
import { totalXp, xpEntries } from '../gamification/xp';
import { Exercise } from '../models/content.models';
import { FocusSession, Progress, SessionBlock } from '../models/progress.models';
import { isCompleted } from '../progress/progress-updates';
import { lessonToStudy, practiceExercise } from './next-activity';
import { attemptExerciseId, strugglingConcepts } from './performance';
import { dueReviews } from './spaced-repetition';

/** Used when the student picks "no limit": a full, unhurried session. */
export const UNLIMITED_BUDGET_MINUTES = 90;
const SUMMARY_MINUTES = 3;
const MINUTES_PER_REVIEW = 2;
const MAX_REVIEW_MINUTES = 10;
const MIN_LESSON_MINUTES = 10;

export interface SessionPlan {
  readonly blocks: readonly SessionBlock[];
  /** What did not make it into the plan, and why (shown, so nothing is hidden). */
  readonly omitted: readonly string[];
}

/**
 * Suggests a session that fits the available time: quick review → new content →
 * practice → summary. Every block says why it is there; the student may skip any of them.
 */
export function planSession(
  catalog: ContentCatalog,
  progress: Progress,
  minutes: number | null,
  now: Date,
): SessionPlan {
  const blocks: SessionBlock[] = [];
  const omitted: string[] = [];
  let left = (minutes ?? UNLIMITED_BUDGET_MINUTES) - SUMMARY_MINUTES;

  // 1. Quick review.
  const due = dueReviews(progress, now);
  if (due.length > 0) {
    const estimate = Math.max(
      MINUTES_PER_REVIEW,
      Math.min(due.length * MINUTES_PER_REVIEW, MAX_REVIEW_MINUTES, left),
    );
    blocks.push({
      id: 'review',
      kind: 'review',
      title: `Revisão rápida (${due.length} ${due.length === 1 ? 'conceito' : 'conceitos'})`,
      reason: 'Conceitos com revisão vencida: revisar no intervalo certo é o que fixa o conteúdo.',
      estimatedMinutes: estimate,
      target: { type: 'review' },
    });
    left -= estimate;
  } else {
    omitted.push('Revisão: nenhum conceito com revisão vencida hoje.');
  }

  // Practice candidate (decided now so the lesson leaves room for it).
  const practice = practiceCandidate(catalog, progress);
  const practiceMinutes = practice ? (practice.exercise.kind === 'code' ? 15 : 5) : 0;

  // 2. New content.
  const study = lessonToStudy(catalog, progress);
  if (study) {
    const { lesson, stepIndex = 0 } = study;
    const remaining = Math.max(
      1,
      Math.ceil(
        (lesson.estimatedMinutes * (lesson.steps.length - stepIndex)) / lesson.steps.length,
      ),
    );
    const room =
      practice && left - practiceMinutes >= MIN_LESSON_MINUTES ? left - practiceMinutes : left;
    if (room >= MIN_LESSON_MINUTES || room >= remaining) {
      const estimate = Math.min(remaining, room);
      blocks.push({
        id: 'lesson',
        kind: 'lesson',
        title: lesson.title,
        reason:
          estimate < remaining
            ? `Conteúdo novo: avance até onde der (cerca de ${estimate} dos ${remaining} min restantes da lição).`
            : study.stepIndex !== undefined
              ? `Conteúdo novo: continue de onde parou (etapa ${stepIndex + 1} de ${lesson.steps.length}).`
              : 'Conteúdo novo: a próxima lição da trilha.',
        estimatedMinutes: estimate,
        target: { type: 'lesson', lessonId: lesson.id },
      });
      left -= estimate;
    } else {
      omitted.push(
        `Conteúdo novo: “${lesson.title}” precisa de mais tempo do que esta sessão tem.`,
      );
    }
  } else {
    omitted.push('Conteúdo novo: todas as lições publicadas estão concluídas.');
  }

  // 3. Practice.
  if (practice && practiceMinutes <= left) {
    blocks.push({
      id: 'practice',
      kind: 'practice',
      title: practice.exercise.title,
      reason: practice.reason,
      estimatedMinutes: practiceMinutes,
      target: { type: 'exercise', exerciseId: practice.exercise.id },
    });
  } else {
    omitted.push(
      practice
        ? 'Prática: não sobrou tempo para um exercício nesta sessão.'
        : 'Prática: não há exercícios pendentes fora das lições.',
    );
  }

  // 4. Summary, always.
  blocks.push({
    id: 'summary',
    kind: 'summary',
    title: 'Resumo final',
    reason: 'Registrar o que você aprendeu ajuda a lembrar e mostra o que revisar depois.',
    estimatedMinutes: SUMMARY_MINUTES,
    target: { type: 'summary' },
  });
  return { blocks, omitted };
}

/** Recurring mistake first; otherwise an unsolved exercise outside lessons (easiest kinds first). */
function practiceCandidate(
  catalog: ContentCatalog,
  progress: Progress,
): { exercise: Exercise; reason: string } | undefined {
  const [struggling] = strugglingConcepts(catalog, progress);
  if (struggling) {
    const exercise = practiceExercise(catalog, progress, struggling.conceptId);
    if (exercise) {
      return {
        exercise,
        reason: `Prática: você errou ${struggling.errors} das últimas ${struggling.attempts} tentativas sobre “${struggling.title}”.`,
      };
    }
  }
  const inLessons = new Set(
    catalog.lessons.flatMap((l) => l.steps.flatMap((s) => s.exerciseIds ?? [])),
  );
  const unsolved = catalog.exercises.filter(
    (e) => !inLessons.has(e.id) && !isCompleted(progress, 'exercise', e.id),
  );
  const exercise = unsolved.find((e) => e.kind !== 'code') ?? unsolved[0];
  return exercise
    ? { exercise, reason: 'Prática: um exercício que você ainda não resolveu.' }
    : undefined;
}

/** Minutes of actual session time (pauses excluded). */
export function activeMinutes(session: FocusSession, now: Date): number {
  const end = session.endedAt ? Date.parse(session.endedAt) : now.getTime();
  const pausing =
    session.pausedAt && !session.endedAt ? now.getTime() - Date.parse(session.pausedAt) : 0;
  return Math.max(
    0,
    Math.round((end - Date.parse(session.startedAt) - session.pausedMs - pausing) / 60000),
  );
}

export interface SessionSummary {
  readonly correctAnswers: number;
  readonly wrongAnswers: number;
  readonly exercisesSolved: readonly string[];
  readonly conceptsReviewed: readonly string[];
  readonly lessonsCompleted: readonly string[];
  readonly xp: number;
  readonly achievements: readonly string[];
  readonly minutes: number;
  readonly blocksDone: number;
  readonly blocksSkipped: number;
}

/**
 * Demonstrated learning within the session window, derived from the history (attempts,
 * first completions, reviews, XP, achievements). Time is reported, never the main measure.
 */
export function sessionSummary(
  catalog: ContentCatalog,
  progress: Progress,
  session: FocusSession,
  now: Date,
): SessionSummary {
  const from = session.startedAt;
  const to = session.endedAt ?? now.toISOString();
  const inWindow = (at: string) => at >= from && at <= to;
  const titleOf = (id: string) => catalog.exercises.find((e) => e.id === id)?.title ?? id;

  const attempts = progress.attempts.filter(
    (a) => inWindow(a.submittedAt) && a.activityType !== 'project',
  );
  const firstCompletions = (prefix: string) =>
    Object.entries(progress.completions)
      .filter(([key, record]) => key.startsWith(prefix) && inWindow(record.firstCompletedAt))
      .map(([key]) => key.slice(prefix.length));

  const reviewed = attempts
    .filter((a) => a.activityType === 'review' && a.correct)
    .map((a) => catalog.concepts.find((c) => c.id === a.activityId)?.title ?? a.activityId);

  return {
    correctAnswers: attempts.filter((a) => a.correct).length,
    wrongAnswers: attempts.filter((a) => !a.correct).length,
    exercisesSolved: firstCompletions('exercise:').map(titleOf),
    conceptsReviewed: [...new Set(reviewed)],
    lessonsCompleted: firstCompletions('lesson:').map(
      (id) => catalog.lessons.find((l) => l.id === id)?.title ?? id,
    ),
    xp: totalXp(xpEntries(catalog, progress).filter((e) => inWindow(e.at))),
    achievements: achievementStates(catalog, progress)
      .filter((s) => s.unlockedAt && inWindow(s.unlockedAt))
      .map((s) => catalog.achievements.find((a) => a.id === s.id)?.title ?? s.id),
    minutes: activeMinutes(session, now),
    blocksDone: session.doneBlockIds.length,
    blocksSkipped: session.skippedBlockIds.length,
  };
}

/** Exercise ids touched in the session (to show "answered" state on blocks). */
export function exercisesAnsweredIn(
  progress: Progress,
  session: FocusSession,
  now: Date,
): Set<string> {
  const to = session.endedAt ?? now.toISOString();
  return new Set(
    progress.attempts
      .filter((a) => a.submittedAt >= session.startedAt && a.submittedAt <= to)
      .map(attemptExerciseId)
      .filter((id): id is string => id !== undefined),
  );
}
