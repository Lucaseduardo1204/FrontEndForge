import { WORKER_RUNNER_SOURCE } from './runner-source';

interface FakeWorkerScope {
  onmessage: ((event: { data: unknown }) => Promise<void>) | null;
  postMessage: (message: unknown) => void;
  [key: string]: unknown;
}

/** Evaluates the real runner source against a fake worker global and runs one request. */
async function runInFakeWorker(
  code: string,
  tests: { id: string; source: string }[] = [],
): Promise<Record<string, unknown>> {
  const posted: unknown[] = [];
  const scope: FakeWorkerScope = { onmessage: null, postMessage: (m) => posted.push(m) };
  new Function('self', WORKER_RUNNER_SOURCE)(scope);
  await scope.onmessage!({ data: { type: 'run', runId: 'run-1', code, tests } });
  return posted[0] as Record<string, unknown>;
}

describe('worker runner source', () => {
  it('captures console output with readable formatting', async () => {
    const result = await runInFakeWorker(
      "console.log('soma', 1 + 2); console.warn({ a: [1, 'x'] }); console.error(null)",
    );

    expect(result['logs']).toEqual([
      { level: 'log', text: 'soma 3' },
      { level: 'warn', text: '{ a: [1, "x"] }' },
      { level: 'error', text: 'null' },
    ]);
    expect(result['error']).toBeNull();
  });

  it('reports passing and failing tests with the reason', async () => {
    const result = await runInFakeWorker('function dobro(n) { return n * 2; }', [
      { id: 'ok', source: 'expect(dobro(2)).toBe(4);' },
      { id: 'wrong', source: 'expect(dobro(3)).toBe(7);' },
      { id: 'deep', source: 'expect([dobro(1)]).toEqual([2]);' },
    ]);

    expect(result['tests']).toEqual([
      { id: 'ok', passed: true, message: '' },
      { id: 'wrong', passed: false, message: 'Esperado 7, recebido 6.' },
      { id: 'deep', passed: true, message: '' },
    ]);
  });

  it('expect.fail reports its message as written, as a failed check', async () => {
    const result = await runInFakeWorker('', [
      { id: 'f', source: "expect.fail('Seus testes deixaram passar um bug.');" },
    ]);

    expect(result['tests']).toEqual([
      { id: 'f', passed: false, message: 'Seus testes deixaram passar um bug.' },
    ]);
  });

  it('reports errors thrown by the code and by tests', async () => {
    const result = await runInFakeWorker("throw new TypeError('quebrou')", [
      { id: 't', source: 'expect(1).toBe(1);' },
    ]);

    expect(result['error']).toEqual({ name: 'TypeError', message: 'quebrou' });
    expect((result['tests'] as { message: string }[])[0].message).toBe(
      'O código lançou um erro durante o teste: TypeError: quebrou',
    );
  });

  it('reports syntax errors instead of crashing', async () => {
    const result = await runInFakeWorker('function (', [{ id: 't', source: 'expect(1).toBe(1);' }]);

    expect((result['error'] as { name: string }).name).toBe('SyntaxError');
    expect((result['tests'] as { passed: boolean }[])[0].passed).toBe(false);
  });

  it('runs every test in a fresh scope (state does not leak between tests)', async () => {
    const result = await runInFakeWorker(
      'let contador = 0; function somar() { return ++contador; }',
      [
        { id: 'a', source: 'expect(somar()).toBe(1);' },
        { id: 'b', source: 'expect(somar()).toBe(1);' },
      ],
    );

    expect((result['tests'] as { passed: boolean }[]).every((t) => t.passed)).toBe(true);
  });

  it('supports async code in tests', async () => {
    const result = await runInFakeWorker(
      'const esperar = (v) => new Promise((r) => setTimeout(() => r(v), 1));',
      [{ id: 'async', source: 'expect(await esperar(5)).toBe(5);' }],
    );

    expect((result['tests'] as { passed: boolean }[])[0].passed).toBe(true);
  });

  it('removes network and messaging APIs from the scope', async () => {
    const posted: unknown[] = [];
    const scope: FakeWorkerScope = {
      onmessage: null,
      postMessage: (m) => posted.push(m),
      fetch: () => 'network',
      indexedDB: {},
    };
    new Function('self', WORKER_RUNNER_SOURCE)(scope);

    expect(scope['fetch']).toBeUndefined();
    expect(scope['indexedDB']).toBeUndefined();
    expect(scope.postMessage).toBeUndefined();
  });

  it('ignores malformed requests and runs only once', async () => {
    const posted: unknown[] = [];
    const scope: FakeWorkerScope = { onmessage: null, postMessage: (m) => posted.push(m) };
    new Function('self', WORKER_RUNNER_SOURCE)(scope);

    await scope.onmessage!({ data: { type: 'run', runId: 1, code: 'x', tests: [] } });
    await scope.onmessage!({ data: { type: 'run', runId: 'a', code: '', tests: [] } });
    await scope.onmessage!({ data: { type: 'run', runId: 'b', code: '', tests: [] } });

    expect(posted).toHaveLength(1);
    expect((posted[0] as { runId: string }).runId).toBe('a');
  });
});
