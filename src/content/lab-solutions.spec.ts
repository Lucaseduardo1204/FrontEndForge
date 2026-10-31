import { transform } from 'sucrase';
import { WORKER_RUNNER_SOURCE } from '../app/core/lab/runner-source';
import { CodeExercise } from '../app/core/models/content.models';
import { CONTENT } from './index';
import { ANGULAR_TEMPLATES_01_EXERCISES } from './exercises/angular-templates-01.exercises';
import { JS_COLLECTIONS_01_EXERCISES } from './exercises/js-collections-01.exercises';
import { TOOLING_LINT_01_EXERCISES } from './exercises/tooling-lint-01.exercises';
import { ARCH_DEPS_01_EXERCISES } from './exercises/arch-deps-01.exercises';
import { WEB_URL_01_EXERCISES } from './exercises/web-url-01.exercises';
import { HTML_TABLES_MEDIA_01_EXERCISES } from './exercises/html-tables-media-01.exercises';
import { TESTING_ASYNC_01_EXERCISES } from './exercises/testing-async-01.exercises';
import { PERF_RUNTIME_01_EXERCISES } from './exercises/perf-runtime-01.exercises';
import { TS_CONST_SATISFIES_01_EXERCISES } from './exercises/ts-const-satisfies-01.exercises';
import { JS_ERRORS_01_EXERCISES } from './exercises/js-errors-01.exercises';
import { CSS_RESPONSIVE_01_EXERCISES } from './exercises/css-responsive-01.exercises';
import { ANGULAR_SIGNALS_01_EXERCISES } from './exercises/angular-signals-01.exercises';
import { JS_TYPES_01_EXERCISES } from './exercises/js-types-01.exercises';
import { ARCH_STATE_01_EXERCISES } from './exercises/arch-state-01.exercises';
import { TOOLING_CI_01_EXERCISES } from './exercises/tooling-ci-01.exercises';
import { JS_FUNCTIONAL_01_EXERCISES } from './exercises/js-functional-01.exercises';
import { HTML_FORMS_01_EXERCISES } from './exercises/html-forms-01.exercises';
import { WEB_HTTP_01_EXERCISES } from './exercises/web-http-01.exercises';
import { CSS_LAYOUT_01_EXERCISES } from './exercises/css-layout-01.exercises';
import { TS_GENERICS_01_EXERCISES } from './exercises/ts-generics-01.exercises';
import { TOOLING_GIT_01_EXERCISES } from './exercises/tooling-git-01.exercises';
import { ARCH_BOUNDARIES_01_EXERCISES } from './exercises/arch-boundaries-01.exercises';
import { A11Y_PRACTICE_01_EXERCISES } from './exercises/a11y-practice-01.exercises';
import { PERF_LOADING_01_EXERCISES } from './exercises/perf-loading-01.exercises';
import { SECURITY_DATA_01_EXERCISES } from './exercises/security-data-01.exercises';
import { SECURITY_SESSION_01_EXERCISES } from './exercises/security-session-01.exercises';
import { SECURITY_XSS_01_EXERCISES } from './exercises/security-xss-01.exercises';
import { TESTING_UNIT_01_EXERCISES } from './exercises/testing-unit-01.exercises';
import { JS_CLOSURES_01_EXERCISES } from './exercises/js-closures-01.exercises';
import { CSS_CASCADE_01_EXERCISES } from './exercises/css-cascade-01.exercises';
import { JS_ASYNC_01_EXERCISES } from './exercises/js-async-01.exercises';
import { TS_NARROWING_01_EXERCISES } from './exercises/ts-narrowing-01.exercises';
import { HTML_SEMANTIC_RESPONSIVE_01_EXERCISES } from './exercises/html-semantic-responsive-01.exercises';
import { JS_DOM_INTERACTIVE_01_EXERCISES } from './exercises/js-dom-interactive-01.exercises';
import { LAB_EXERCISES } from './exercises/lab.exercises';
import { SHOPPING_STATE_JS } from './lessons/js-dom-interactive-01';
import { MISSION_EXERCISES } from './exercises/missions.exercises';

/** Depends on real layout (jsdom has none): verified in a real browser instead. */
const LAYOUT_DEPENDENT = new Set(['mission-layout-fix', 'lab-css-layout', 'lab-css-container']);

const CODE_EXERCISES = [
  ...LAB_EXERCISES,
  ...MISSION_EXERCISES,
  ...HTML_SEMANTIC_RESPONSIVE_01_EXERCISES,
  ...JS_DOM_INTERACTIVE_01_EXERCISES,
  ...CSS_CASCADE_01_EXERCISES,
  ...JS_ASYNC_01_EXERCISES,
  ...TS_NARROWING_01_EXERCISES,
  ...JS_CLOSURES_01_EXERCISES,
  ...TESTING_UNIT_01_EXERCISES,
  ...SECURITY_XSS_01_EXERCISES,
  ...SECURITY_SESSION_01_EXERCISES,
  ...SECURITY_DATA_01_EXERCISES,
  ...PERF_LOADING_01_EXERCISES,
  ...A11Y_PRACTICE_01_EXERCISES,
  ...ARCH_BOUNDARIES_01_EXERCISES,
  ...TOOLING_GIT_01_EXERCISES,
  ...CSS_LAYOUT_01_EXERCISES,
  ...TS_GENERICS_01_EXERCISES,
  ...WEB_HTTP_01_EXERCISES,
  ...HTML_FORMS_01_EXERCISES,
  ...JS_FUNCTIONAL_01_EXERCISES,
  ...TOOLING_CI_01_EXERCISES,
  ...ARCH_STATE_01_EXERCISES,
  ...JS_TYPES_01_EXERCISES,
  ...ANGULAR_SIGNALS_01_EXERCISES,
  ...CSS_RESPONSIVE_01_EXERCISES,
  ...JS_ERRORS_01_EXERCISES,
  ...TS_CONST_SATISFIES_01_EXERCISES,
  ...PERF_RUNTIME_01_EXERCISES,
  ...TESTING_ASYNC_01_EXERCISES,
  ...HTML_TABLES_MEDIA_01_EXERCISES,
  ...WEB_URL_01_EXERCISES,
  ...ARCH_DEPS_01_EXERCISES,
  ...TOOLING_LINT_01_EXERCISES,
  ...JS_COLLECTIONS_01_EXERCISES,
  ...ANGULAR_TEMPLATES_01_EXERCISES,
].filter((e): e is CodeExercise => e.kind === 'code' && !LAYOUT_DEPENDENT.has(e.id));

/**
 * Runs each lab exercise against its own reference solution (must pass every test)
 * and against the starter code (must fail at least one), using the real runner source.
 */
async function runScript(
  exercise: CodeExercise,
  code: string,
): Promise<{ passed: boolean; message: string }[]> {
  const js =
    exercise.language === 'typescript'
      ? transform(code, { transforms: ['typescript'], disableESTransforms: true }).code
      : code;
  const posted: { tests: { passed: boolean; message: string }[] }[] = [];
  const scope = {
    onmessage: null as null | ((e: unknown) => Promise<void>),
    postMessage: (m: never) => posted.push(m),
  };
  new Function('self', WORKER_RUNNER_SOURCE)(scope);
  await scope.onmessage!({
    data: { type: 'run', runId: 'r', code: js, tests: exercise.tests },
  });
  return posted[0].tests;
}

/** HTML exercises: render into the test DOM and run the test sources against it. */
function runHtml(exercise: CodeExercise, html: string): boolean[] {
  document.body.innerHTML = html;
  return exercise.tests.map((test) => {
    try {
      const expect = (actual: unknown) => ({
        toBe: (expected: unknown) => {
          if (!Object.is(actual, expected)) throw new Error(`${actual} !== ${expected}`);
        },
        toBeTruthy: () => {
          if (!actual) throw new Error('falsy');
        },
        toEqual: (expected: unknown) => {
          if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('not equal');
        },
      });
      new Function('expect', 'document', 'window', test.source)(expect, document, window);
      return true;
    } catch {
      return false;
    }
  });
}

function solutionCode(exercise: CodeExercise): string {
  const block = exercise.solution.find((b) => b.type === 'code');
  if (!block || block.type !== 'code') throw new Error(`${exercise.id} sem solução em código`);
  return block.code;
}

describe('code exercise solutions (lab and missions)', () => {
  for (const exercise of CODE_EXERCISES) {
    if (exercise.language === 'html') {
      it(`${exercise.id}: the reference solution passes and the starter code fails`, () => {
        expect(runHtml(exercise, solutionCode(exercise))).toEqual(exercise.tests.map(() => true));
        expect(runHtml(exercise, exercise.starterCode)).toContain(false);
      });
      continue;
    }

    it(`${exercise.id}: the reference solution passes every test`, async () => {
      const results = await runScript(exercise, solutionCode(exercise));

      expect(results.filter((r) => !r.passed)).toEqual([]);
      expect(results).toHaveLength(exercise.tests.length);
    });

    it(`${exercise.id}: the starter code fails at least one test`, async () => {
      const results = await runScript(exercise, exercise.starterCode);

      expect(results.some((r) => !r.passed)).toBe(true);
    });
  }

  it('the state functions shown in the DOM lesson pass the lab exercise tests (drift guard)', async () => {
    const exercise = JS_DOM_INTERACTIVE_01_EXERCISES.find(
      (e): e is CodeExercise => e.id === 'lab-js-shopping-list',
    )!;

    const results = await runScript(exercise, SHOPPING_STATE_JS);

    expect(results.filter((r) => !r.passed)).toEqual([]);
  });

  it('catches the classic "constructor" bug in the naive counting solution', async () => {
    const exercise = LAB_EXERCISES.find((e) => e.id === 'lab-js-count-occurrences')!;
    const naive = `function contarOcorrencias(itens) {
      const c = {};
      for (const i of itens) { const k = i.toLowerCase(); c[k] = (c[k] || 0) + 1; }
      return c;
    }`;

    const results = await runScript(exercise, naive);

    expect(results.map((r) => r.passed)).toEqual([true, true, true, false]);
  });
});

/** Methods of built-in objects that also start with "to" (string, number, date, array). */
const BUILT_IN_TO_METHODS = new Set([
  'toLowerCase',
  'toUpperCase',
  'toString',
  'toFixed',
  'toISOString',
  'toLocaleString',
  'toSorted',
  'toReversed',
  'toSpliced',
]);

describe('code exercise tests only use what the real runner provides', () => {
  it('every matcher in a test source exists in the runner expect, and .not is not used', () => {
    const runnerMatchers = new Set(
      [...WORKER_RUNNER_SOURCE.matchAll(/^\s{4}(to\w+)\(/gm)].map((m) => m[1]),
    );
    const allCode = CONTENT.exercises.filter((e): e is CodeExercise => e.kind === 'code');
    const problems = allCode.flatMap((e) =>
      e.tests.flatMap((t) => [
        ...[...t.source.matchAll(/\)\.(to[A-Z]\w*)\(/g)]
          .map((m) => m[1])
          .filter((name) => !BUILT_IN_TO_METHODS.has(name) && !runnerMatchers.has(name))
          .map((name) => `${e.id}/${t.id}: ${name}`),
        ...(/\.not\./.test(t.source) ? [`${e.id}/${t.id}: .not`] : []),
      ]),
    );

    expect(runnerMatchers.has('toEqual')).toBe(true);
    expect(problems).toEqual([]);
  });
});
