import { FocusSession, Progress, SessionBlock } from '../models/progress.models';

/** The session in progress: the last one, while it has no `endedAt`. */
export function activeSession(progress: Progress): FocusSession | undefined {
  const last = progress.sessions.at(-1);
  return last && !last.endedAt ? last : undefined;
}

export function startSession(
  progress: Progress,
  options: {
    readonly id: string;
    readonly plannedMinutes: number | null;
    readonly objective: string;
    readonly timerEnabled: boolean;
    readonly blocks: readonly SessionBlock[];
  },
  now: Date,
): Progress {
  // Only one session at a time: an open one is closed before starting another.
  const closed = activeSession(progress) ? endSession(progress, now) : progress;
  const session: FocusSession = {
    ...options,
    objective: options.objective.trim(),
    startedAt: now.toISOString(),
    doneBlockIds: [],
    skippedBlockIds: [],
    pausedMs: 0,
  };
  return { ...closed, updatedAt: now.toISOString(), sessions: [...closed.sessions, session] };
}

function updateActive(
  progress: Progress,
  now: Date,
  change: (session: FocusSession) => FocusSession,
): Progress {
  const session = activeSession(progress);
  if (!session) return progress;
  return {
    ...progress,
    updatedAt: now.toISOString(),
    sessions: [...progress.sessions.slice(0, -1), change(session)],
  };
}

export function setBlockState(
  progress: Progress,
  blockId: string,
  state: 'done' | 'skipped' | 'pending',
  now: Date,
): Progress {
  return updateActive(progress, now, (s) => ({
    ...s,
    doneBlockIds: [
      ...s.doneBlockIds.filter((id) => id !== blockId),
      ...(state === 'done' ? [blockId] : []),
    ],
    skippedBlockIds: [
      ...s.skippedBlockIds.filter((id) => id !== blockId),
      ...(state === 'skipped' ? [blockId] : []),
    ],
  }));
}

export function pauseSession(progress: Progress, now: Date): Progress {
  return updateActive(progress, now, (s) =>
    s.pausedAt ? s : { ...s, pausedAt: now.toISOString() },
  );
}

export function resumeSession(progress: Progress, now: Date): Progress {
  return updateActive(progress, now, (s) => {
    if (!s.pausedAt) return s;
    const { pausedAt, ...rest } = s;
    return { ...rest, pausedMs: s.pausedMs + Math.max(0, now.getTime() - Date.parse(pausedAt)) };
  });
}

/** Ends the active session (an open pause counts as paused time). */
export function endSession(progress: Progress, now: Date): Progress {
  const resumed = resumeSession(progress, now);
  return updateActive(resumed, now, (s) => ({ ...s, endedAt: now.toISOString() }));
}

/** Saves the student's notes on a finished session. */
export function setSessionNotes(
  progress: Progress,
  sessionId: string,
  notes: string,
  now: Date,
): Progress {
  return {
    ...progress,
    updatedAt: now.toISOString(),
    sessions: progress.sessions.map((s) =>
      s.id === sessionId ? { ...s, notes: notes.trim() } : s,
    ),
  };
}
