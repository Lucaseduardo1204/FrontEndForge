import { Mission } from '../models/content.models';
import { IsoDateTime, Progress } from '../models/progress.models';
import { completionKey } from './progress-updates';

export interface MissionStatus {
  readonly solved: number;
  readonly total: number;
  /** Any attempt on one of its tasks. */
  readonly started: boolean;
  /** When the last task was first solved; null until every task is solved. */
  readonly completedAt: IsoDateTime | null;
}

/**
 * Derived from the tasks (exercises): a mission is complete when every task has a correct
 * attempt. No separate state is stored.
 */
export function missionStatus(mission: Mission, progress: Progress): MissionStatus {
  const dates = mission.exerciseIds.map(
    (id) => progress.completions[completionKey('exercise', id)]?.firstCompletedAt,
  );
  const solved = dates.filter((d) => d !== undefined).length;
  const total = mission.exerciseIds.length;
  return {
    solved,
    total,
    started: progress.attempts.some((a) => mission.exerciseIds.includes(a.activityId)),
    completedAt:
      total > 0 && solved === total
        ? (dates as IsoDateTime[]).reduce((latest, d) => (d > latest ? d : latest))
        : null,
  };
}
