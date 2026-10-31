import { Project } from '../models/content.models';
import { Attempt, IsoDateTime, Progress, ProjectProgress } from '../models/progress.models';
import { completionKey, toLocalDay } from './progress-updates';

function current(progress: Progress, projectId: string, now: Date): ProjectProgress {
  return (
    progress.projects[projectId] ?? {
      startedAt: now.toISOString(),
      checkedItems: [],
      selfAssessment: {},
    }
  );
}

function withProject(
  progress: Progress,
  projectId: string,
  project: ProjectProgress,
  now: Date,
): Progress {
  const day = toLocalDay(now);
  return {
    ...progress,
    updatedAt: now.toISOString(),
    projects: { ...progress.projects, [projectId]: project },
    studyDays: progress.studyDays.includes(day) ? progress.studyDays : [...progress.studyDays, day],
  };
}

export function startProject(progress: Progress, projectId: string, now: Date): Progress {
  if (progress.projects[projectId]) return progress;
  return withProject(progress, projectId, current(progress, projectId, now), now);
}

export function setChecklistItem(
  progress: Progress,
  projectId: string,
  itemId: string,
  checked: boolean,
  now: Date,
): Progress {
  const project = current(progress, projectId, now);
  const others = project.checkedItems.filter((id) => id !== itemId);
  return withProject(
    progress,
    projectId,
    { ...project, checkedItems: checked ? [...others, itemId] : others },
    now,
  );
}

export function setSelfAssessment(
  progress: Progress,
  projectId: string,
  criterionId: string,
  score: number,
  now: Date,
): Progress {
  const project = current(progress, projectId, now);
  return withProject(
    progress,
    projectId,
    { ...project, selfAssessment: { ...project.selfAssessment, [criterionId]: score } },
    now,
  );
}

/**
 * Records an automatic check run (`activityType: 'project'`). Unlike exercises, a passing
 * check does not complete anything by itself: `completeProject` does, when all is done.
 */
export function recordProjectCheck(progress: Progress, attempt: Attempt, now: Date): Progress {
  const started = startProject(progress, attempt.activityId, now);
  const day = toLocalDay(now);
  return {
    ...started,
    updatedAt: now.toISOString(),
    attempts: [...started.attempts, attempt],
    studyDays: started.studyDays.includes(day) ? started.studyDays : [...started.studyDays, day],
  };
}

export interface ProjectStatus {
  readonly started: boolean;
  readonly checkedCount: number;
  readonly checklistTotal: number;
  readonly assessedCount: number;
  readonly rubricTotal: number;
  readonly lastCheck: { readonly passed: boolean; readonly at: IsoDateTime } | null;
  readonly completedAt: IsoDateTime | null;
  /** What is still missing to complete, in plain language (empty when it can be completed). */
  readonly missing: readonly string[];
}

export function projectStatus(project: Project, progress: Progress): ProjectStatus {
  const state = progress.projects[project.id];
  const itemIds = project.steps.flatMap((s) => s.checklist.map((item) => item.id));
  const checkedCount = itemIds.filter((id) => state?.checkedItems.includes(id)).length;
  const assessedCount = project.rubric.filter(
    (c) => state?.selfAssessment[c.id] !== undefined,
  ).length;
  const last = [...progress.attempts]
    .reverse()
    .find((a) => a.activityType === 'project' && a.activityId === project.id);
  const lastCheck = last ? { passed: last.correct, at: last.submittedAt } : null;

  const missing: string[] = [];
  if (!lastCheck?.passed) {
    missing.push(
      lastCheck
        ? 'A última verificação automática ainda tem testes falhando.'
        : 'Execute a verificação automática do seu código.',
    );
  }
  if (checkedCount < itemIds.length) {
    missing.push(`Marque os itens do checklist (${checkedCount} de ${itemIds.length}).`);
  }
  if (assessedCount < project.rubric.length) {
    missing.push(
      `Preencha a autoavaliação (${assessedCount} de ${project.rubric.length} critérios).`,
    );
  }

  return {
    started: state !== undefined,
    checkedCount,
    checklistTotal: itemIds.length,
    assessedCount,
    rubricTotal: project.rubric.length,
    lastCheck,
    completedAt: state?.completedAt ?? null,
    missing,
  };
}

/** Completes the project once every requirement is met. Returns the input otherwise. */
export function completeProject(progress: Progress, project: Project, now: Date): Progress {
  const status = projectStatus(project, progress);
  if (status.completedAt || status.missing.length > 0) return progress;
  const state = current(progress, project.id, now);
  const next = withProject(progress, project.id, { ...state, completedAt: now.toISOString() }, now);
  return {
    ...next,
    completions: {
      ...next.completions,
      [completionKey('project', project.id)]: { firstCompletedAt: now.toISOString() },
    },
  };
}
