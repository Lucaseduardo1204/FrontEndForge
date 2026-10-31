import { ExerciseLocation, NextActivity } from '../../../core/learning/next-activity';

export interface NextActivityView {
  readonly label: string;
  readonly title: string;
  readonly summary?: string;
  readonly reason: string;
  readonly action?: {
    readonly text: string;
    readonly commands: readonly string[];
    readonly queryParams?: Readonly<Record<string, string>>;
  };
}

/** What the dashboard shows for each kind of recommendation. */
export function nextActivityView(next: NextActivity): NextActivityView {
  switch (next.kind) {
    case 'review':
      return {
        label: 'Revisão espaçada',
        title:
          next.conceptTitles.length === 1
            ? `Revisar “${next.conceptTitles[0]}”`
            : `Revisar ${next.conceptTitles.length} conceitos`,
        summary: next.conceptTitles.length > 1 ? next.conceptTitles.join(', ') : undefined,
        reason: next.reason,
        action: { text: 'Começar revisão', commands: ['/review'] },
      };
    case 'practice':
      return {
        label: 'Reforço',
        title: next.exercise.title,
        reason: next.reason,
        action: practiceAction(next.location, next.exercise.id),
      };
    case 'continue-lesson':
      return {
        label: 'Lição em andamento',
        title: next.lesson.title,
        summary: next.lesson.summary,
        reason: next.reason,
        action: { text: 'Continuar estudando', commands: ['/lessons', next.lesson.id] },
      };
    case 'start-lesson':
      return {
        label: 'Próxima lição',
        title: next.lesson.title,
        summary: next.lesson.summary,
        reason: next.reason,
        action: { text: 'Começar a lição', commands: ['/lessons', next.lesson.id] },
      };
    case 'lab-exercise':
      return {
        label: 'Laboratório',
        title: next.exercise.title,
        reason: next.reason,
        action: { text: 'Abrir no laboratório', commands: ['/lab', next.exercise.id] },
      };
    case 'continue-mission':
    case 'start-mission':
      return {
        label: next.kind === 'continue-mission' ? 'Missão em andamento' : 'Missão',
        title: next.mission.title,
        summary: next.mission.objective,
        reason: next.reason,
        action: {
          text: next.kind === 'continue-mission' ? 'Continuar a missão' : 'Começar a missão',
          commands: ['/missions', next.mission.id],
        },
      };
    case 'continue-project':
    case 'start-project':
      return {
        label: next.kind === 'continue-project' ? 'Projeto em andamento' : 'Projeto guiado',
        title: next.project.title,
        summary: next.project.problem,
        reason: next.reason,
        action: {
          text: next.kind === 'continue-project' ? 'Continuar o projeto' : 'Começar o projeto',
          commands: ['/projects', next.project.id],
        },
      };
    case 'all-done':
      return { label: 'Tudo em dia', title: 'Nada pendente por enquanto', reason: next.reason };
  }
}

function practiceAction(
  location: ExerciseLocation,
  exerciseId: string,
): NonNullable<NextActivityView['action']> {
  switch (location.type) {
    case 'lesson':
      return {
        text: 'Praticar este exercício',
        commands: ['/lessons', location.lessonId],
        queryParams: { step: String(location.stepIndex + 1) },
      };
    case 'mission':
      return { text: 'Praticar na missão', commands: ['/missions', location.missionId] };
    case 'bug':
      return { text: 'Praticar no bestiário', commands: ['/bugs', location.bugId] };
    case 'lab':
      return { text: 'Praticar no laboratório', commands: ['/lab', exerciseId] };
  }
}
