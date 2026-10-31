import { ActivityType, Progress, SessionBlock } from '../models/progress.models';

export const CURRENT_SCHEMA_VERSION = 4;

/** Raised when stored or imported data cannot be turned into a valid `Progress`. */
export class ProgressDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgressDataError';
  }
}

export function createEmptyProgress(now: Date): Progress {
  const timestamp = now.toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    lessons: {},
    projects: {},
    sessions: [],
    completions: {},
    attempts: [],
    reviews: {},
    studyDays: [],
  };
}

type RawRecord = Record<string, unknown>;

/**
 * Step `n` upgrades data from schema version `n` to `n + 1`.
 * Add an entry here whenever `Progress` changes shape, and bump `CURRENT_SCHEMA_VERSION`.
 */
const MIGRATIONS: Readonly<Record<number, (data: RawRecord) => RawRecord>> = {
  // v1 → v2: `xp` and `achievements` are now derived from the attempt history.
  // No version ever wrote to them, so dropping them loses nothing.
  1: (data) => {
    const rest = { ...data };
    delete rest['xp'];
    delete rest['achievements'];
    return rest;
  },
  // v2 → v3: project checklists and self-assessment.
  2: (data) => ({ ...data, projects: {} }),
  // v3 → v4: focus sessions.
  3: (data) => ({ ...data, sessions: [] }),
};

/**
 * Turns unknown data (from storage or an imported file) into a valid `Progress`,
 * upgrading older schema versions. Throws `ProgressDataError` with a message in pt-BR.
 */
export function migrateProgress(raw: unknown): Progress {
  if (!isRecord(raw)) {
    throw new ProgressDataError('O conteúdo não é um objeto de progresso válido.');
  }
  const version = raw['schemaVersion'];
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new ProgressDataError('O campo "schemaVersion" está ausente ou inválido.');
  }
  if (version > CURRENT_SCHEMA_VERSION) {
    throw new ProgressDataError(
      `Os dados foram salvos por uma versão mais nova da plataforma (esquema ${version}). ` +
        'Atualize a aplicação antes de carregá-los.',
    );
  }

  let data: RawRecord = raw;
  for (let v = version; v < CURRENT_SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) {
      throw new ProgressDataError(`Não existe migração do esquema ${v} para ${v + 1}.`);
    }
    data = { ...step(data), schemaVersion: v + 1 };
  }

  assertShape(data);
  return data;
}

/** Parses an exported progress file. Throws `ProgressDataError`. */
export function parseProgressJson(json: string): Progress {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new ProgressDataError('O conteúdo não é um JSON válido.');
  }
  return migrateProgress(parsed);
}

/**
 * Checks every field against the model. Imported files are untrusted: a malformed entry that
 * slipped through would be saved and break the pages that read it on every visit.
 */
function assertShape(data: RawRecord): asserts data is RawRecord & Progress {
  const problems: string[] = [];
  const check = (ok: boolean, path: string) => {
    if (!ok) problems.push(path);
  };

  check(isIso(data['createdAt']), 'createdAt');
  check(isIso(data['updatedAt']), 'updatedAt');
  eachEntry(data, 'lessons', problems, (lesson, at) => {
    check(isIso(lesson['startedAt']), `${at}.startedAt`);
    check(isIndex(lesson['currentStepIndex']), `${at}.currentStepIndex`);
    check(optional(lesson['completedAt'], isIso), `${at}.completedAt`);
  });
  eachEntry(data, 'projects', problems, (project, at) => {
    check(isIso(project['startedAt']), `${at}.startedAt`);
    check(isStringList(project['checkedItems']), `${at}.checkedItems`);
    const scores = project['selfAssessment'];
    check(
      isRecord(scores) && Object.values(scores).every((v) => typeof v === 'number'),
      `${at}.selfAssessment`,
    );
    check(optional(project['completedAt'], isIso), `${at}.completedAt`);
  });
  eachEntry(data, 'completions', problems, (completion, at) =>
    check(isIso(completion['firstCompletedAt']), `${at}.firstCompletedAt`),
  );
  eachEntry(data, 'reviews', problems, (card, at) => {
    check(typeof card['conceptId'] === 'string', `${at}.conceptId`);
    check([1, 2, 3, 4, 5].includes(card['box'] as number), `${at}.box`);
    check(isDay(card['dueOn']), `${at}.dueOn`);
    check(isIso(card['lastReviewedAt']), `${at}.lastReviewedAt`);
  });
  eachItem(data, 'attempts', problems, (attempt, at) => {
    check(typeof attempt['id'] === 'string', `${at}.id`);
    check(ACTIVITY_TYPES.includes(attempt['activityType'] as string), `${at}.activityType`);
    check(typeof attempt['activityId'] === 'string', `${at}.activityId`);
    check(isIso(attempt['submittedAt']), `${at}.submittedAt`);
    check(typeof attempt['correct'] === 'boolean', `${at}.correct`);
    const score = attempt['score'];
    check(typeof score === 'number' && score >= 0 && score <= 1, `${at}.score`);
    check(isIndex(attempt['hintsUsed']), `${at}.hintsUsed`);
    check(typeof attempt['solutionViewed'] === 'boolean', `${at}.solutionViewed`);
  });
  eachItem(data, 'sessions', problems, (session, at) => {
    check(typeof session['id'] === 'string', `${at}.id`);
    check(isIso(session['startedAt']), `${at}.startedAt`);
    const planned = session['plannedMinutes'];
    check(planned === null || (typeof planned === 'number' && planned > 0), `${at}.plannedMinutes`);
    check(typeof session['objective'] === 'string', `${at}.objective`);
    check(typeof session['timerEnabled'] === 'boolean', `${at}.timerEnabled`);
    const blocks = session['blocks'];
    // The session view always has a block on screen, so an empty plan is invalid too.
    if (!Array.isArray(blocks) || blocks.length === 0) {
      problems.push(`${at}.blocks`);
    } else {
      blocks.forEach((block: unknown, i) => {
        const where = `${at}.blocks[${i}]`;
        if (!isRecord(block)) return problems.push(where);
        check(typeof block['id'] === 'string', `${where}.id`);
        check(BLOCK_KINDS.includes(block['kind'] as string), `${where}.kind`);
        check(typeof block['title'] === 'string', `${where}.title`);
        check(typeof block['reason'] === 'string', `${where}.reason`);
        check(isNonNegative(block['estimatedMinutes']), `${where}.estimatedMinutes`);
        check(isTarget(block['target']), `${where}.target`);
        return undefined;
      });
    }
    check(isStringList(session['doneBlockIds']), `${at}.doneBlockIds`);
    check(isStringList(session['skippedBlockIds']), `${at}.skippedBlockIds`);
    check(isNonNegative(session['pausedMs']), `${at}.pausedMs`);
    for (const key of ['pausedAt', 'endedAt']) {
      check(optional(session[key], isIso), `${at}.${key}`);
    }
    check(
      optional(session['notes'], (v) => typeof v === 'string'),
      `${at}.notes`,
    );
  });
  const days = data['studyDays'];
  check(Array.isArray(days) && days.every(isDay), 'studyDays');

  if (problems.length > 0) {
    const shown = problems.slice(0, MAX_PROBLEMS_SHOWN).join(', ');
    const more =
      problems.length > MAX_PROBLEMS_SHOWN ? ` e mais ${problems.length - MAX_PROBLEMS_SHOWN}` : '';
    throw new ProgressDataError(`Campos inválidos no progresso: ${shown}${more}.`);
  }
}

const MAX_PROBLEMS_SHOWN = 5;
const ACTIVITY_TYPES: readonly string[] = [
  'lesson',
  'exercise',
  'assessment',
  'review',
  'mission',
  'project',
  'bug',
] satisfies ActivityType[];
const BLOCK_KINDS: readonly string[] = [
  'review',
  'lesson',
  'practice',
  'summary',
] satisfies SessionBlock['kind'][];

/** Validates each value of a record field (`lessons`, `reviews`…). */
function eachEntry(
  data: RawRecord,
  key: string,
  problems: string[],
  validate: (entry: RawRecord, path: string) => void,
): void {
  const record = data[key];
  if (!isRecord(record)) return void problems.push(key);
  for (const [id, entry] of Object.entries(record)) {
    if (isRecord(entry)) validate(entry, `${key}.${id}`);
    else problems.push(`${key}.${id}`);
  }
}

/** Validates each item of a list field (`attempts`, `sessions`). */
function eachItem(
  data: RawRecord,
  key: string,
  problems: string[],
  validate: (item: RawRecord, path: string) => void,
): void {
  const list = data[key];
  if (!Array.isArray(list)) return void problems.push(key);
  list.forEach((item: unknown, i) => {
    if (isRecord(item)) validate(item, `${key}[${i}]`);
    else problems.push(`${key}[${i}]`);
  });
}

function isTarget(value: unknown): boolean {
  if (!isRecord(value)) return false;
  switch (value['type']) {
    case 'review':
    case 'summary':
      return true;
    case 'lesson':
      return typeof value['lessonId'] === 'string';
    case 'exercise':
      return typeof value['exerciseId'] === 'string';
    default:
      return false;
  }
}

function isIso(value: unknown): boolean {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isDay(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && isIso(value);
}

function isIndex(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isNonNegative(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isStringList(value: unknown): boolean {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function optional(value: unknown, test: (v: unknown) => boolean): boolean {
  return value === undefined || test(value);
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
