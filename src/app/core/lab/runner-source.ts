/**
 * Source code of the runners that execute student code. These strings never run in the
 * application context: they become a `data:` URL worker (opaque origin, own thread) or a
 * script inside a sandboxed iframe without `allow-same-origin`.
 * Kept as plain ES2020 so it runs as-is in any current browser.
 */

/** Shared helpers: value formatting, `expect` assertions and console capture. */
const HELPERS = String.raw`
const MAX_LOGS = 200;
const MAX_TEXT = 2000;

function format(value, depth, seen) {
  depth = depth || 0;
  seen = seen || new WeakSet();
  if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value);
  if (typeof value === 'bigint') return value + 'n';
  if (typeof value === 'function') return '[função ' + (value.name || 'anônima') + ']';
  if (typeof value === 'symbol') return value.toString();
  if (value === null || typeof value !== 'object') return String(value);
  if (seen.has(value)) return '[referência circular]';
  if (depth > 3) return Array.isArray(value) ? '[Array]' : '[Object]';
  seen.add(value);
  if (Array.isArray(value)) {
    return '[' + value.slice(0, 50).map((v) => format(v, depth + 1, seen)).join(', ') +
      (value.length > 50 ? ', …' : '') + ']';
  }
  if (value instanceof Error) return value.name + ': ' + value.message;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Map) {
    return 'Map(' + value.size + ') {' + Array.from(value.entries()).slice(0, 20)
      .map(([k, v]) => format(k, depth + 1, seen) + ' => ' + format(v, depth + 1, seen)).join(', ') + '}';
  }
  if (value instanceof Set) {
    return 'Set(' + value.size + ') {' + Array.from(value).slice(0, 20)
      .map((v) => format(v, depth + 1, seen)).join(', ') + '}';
  }
  if (typeof Node !== 'undefined' && value instanceof Node) {
    return '<' + (value.nodeName || 'node').toLowerCase() + '>';
  }
  const entries = Object.keys(value).slice(0, 50)
    .map((k) => k + ': ' + format(value[k], depth + 1, seen));
  return '{ ' + entries.join(', ') + ' }';
}

function clip(text) {
  return text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + '… (cortado)' : text;
}

function describeError(error) {
  if (error instanceof Error) return { name: error.name, message: clip(error.message) };
  return { name: 'Error', message: clip('Valor lançado: ' + format(error)) };
}

function makeConsole(logs) {
  const write = (level) => (...args) => {
    if (logs.length >= MAX_LOGS) return;
    logs.push({ level, text: clip(args.map((a) => format(a)).join(' ')) });
  };
  return { log: write('log'), info: write('info'), warn: write('warn'), error: write('error'),
    debug: write('log'), table: write('log') };
}

class AssertionError extends Error {}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}

function expect(actual) {
  const fail = (message) => { throw new AssertionError(message); };
  const shown = (v) => format(v, 1);
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) fail('Esperado ' + shown(expected) + ', recebido ' + shown(actual) + '.');
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) fail('Esperado ' + shown(expected) + ', recebido ' + shown(actual) + '.');
    },
    toBeTruthy() {
      if (!actual) fail('Esperado um valor verdadeiro (truthy), recebido ' + shown(actual) + '.');
    },
    toBeFalsy() {
      if (actual) fail('Esperado um valor falso (falsy), recebido ' + shown(actual) + '.');
    },
    toContain(item) {
      const ok = typeof actual === 'string' || Array.isArray(actual) ? actual.includes(item) : false;
      if (!ok) fail('Esperado que ' + shown(actual) + ' contivesse ' + shown(item) + '.');
    },
    toBeCloseTo(expected, digits) {
      const precision = digits === undefined ? 2 : digits;
      if (!(Math.abs(expected - actual) < Math.pow(10, -precision) / 2)) {
        fail('Esperado aproximadamente ' + shown(expected) + ', recebido ' + shown(actual) + '.');
      }
    },
    toThrow() {
      if (typeof actual !== 'function') fail('toThrow precisa receber uma função.');
      try { actual(); } catch (e) { return; }
      fail('Esperado que a função lançasse um erro, mas ela terminou normalmente.');
    },
  };
}
/** Explicit failure with a message written for the student (shown without the error prefix). */
expect.fail = (message) => {
  throw new AssertionError(String(message));
};

function testFailure(error) {
  if (error instanceof AssertionError) return error.message;
  const e = describeError(error);
  return 'O código lançou um erro durante o teste: ' + e.name + ': ' + e.message;
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
`;

/**
 * Worker runner. Receives one `run` message, runs the code once (capturing console),
 * then runs each test in a fresh scope with the student's code, and posts one `result`.
 * Network and storage APIs are removed first (defense in depth: the opaque origin already
 * keeps the worker away from the application's data).
 */
export const WORKER_RUNNER_SOURCE = String.raw`'use strict';
${HELPERS}
const post = self.postMessage.bind(self);
for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts',
  'indexedDB', 'caches', 'postMessage', 'close']) {
  try { Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false }); } catch (e) {}
}
let started = false;
self.onmessage = async (event) => {
  const data = event.data;
  if (started || !data || data.type !== 'run' || typeof data.runId !== 'string' ||
      typeof data.code !== 'string' || !Array.isArray(data.tests)) return;
  started = true;
  const logs = [];
  let error = null;
  try {
    await new AsyncFunction('console', '"use strict";\n' + data.code)(makeConsole(logs));
  } catch (e) {
    error = describeError(e);
  }
  const tests = [];
  for (const test of data.tests) {
    if (!test || typeof test.id !== 'string' || typeof test.source !== 'string') continue;
    try {
      await new AsyncFunction('console', 'expect',
        '"use strict";\n' + data.code + '\n;{\n' + test.source + '\n}')(makeConsole([]), expect);
      tests.push({ id: test.id, passed: true, message: '' });
    } catch (e) {
      tests.push({ id: test.id, passed: false, message: clip(testFailure(e)) });
    }
  }
  post({ type: 'result', runId: data.runId, logs, error, tests });
};
`;

/**
 * Iframe runner for HTML/CSS. Runs after the student's markup is parsed and checks the DOM.
 * Tests also receive the original `source` text (e.g. to check the <html lang> they wrote).
 * The student's own scripts never run: the document CSP only allows this nonce.
 */
export function iframeRunnerSource(
  runId: string,
  tests: readonly { id: string; source: string }[],
  source = '',
): string {
  // JSON inside a script: escape "<" so no data (including the student's source, given to
  // tests as text) can close the tag.
  const payload = JSON.stringify({ runId, tests, source }).replace(/</g, '\\u003c');
  return String.raw`'use strict';
${HELPERS}
(function () {
  const payload = ${payload};
  const send = (message) => window.parent.postMessage(message, '*');
  send({ type: 'ready', runId: payload.runId });
  window.addEventListener('load', async () => {
    const tests = [];
    for (const test of payload.tests) {
      try {
        await new AsyncFunction('expect', 'document', 'window', 'source', '"use strict";\n' + test.source)(
          expect, document, window, payload.source);
        tests.push({ id: test.id, passed: true, message: '' });
      } catch (e) {
        tests.push({ id: test.id, passed: false, message: clip(testFailure(e)) });
      }
    }
    send({ type: 'result', runId: payload.runId, logs: [], error: null, tests });
  });
})();
`;
}
