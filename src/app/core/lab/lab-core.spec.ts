import { CodeExercise } from '../models/content.models';
import { evaluateCodeRun } from './code-evaluation';
import { isReadyMessage, LIMITS, parseRunnerMessage } from './lab-protocol';
import { buildPreviewDocument } from './preview-document';

describe('isReadyMessage', () => {
  it('accepts only the ready message of the expected run', () => {
    expect(isReadyMessage({ type: 'ready', runId: 'r1' }, 'r1')).toBe(true);
    expect(isReadyMessage({ type: 'ready', runId: 'other' }, 'r1')).toBe(false);
    expect(isReadyMessage({ type: 'result', runId: 'r1' }, 'r1')).toBe(false);
    expect(isReadyMessage('ready', 'r1')).toBe(false);
  });
});

describe('parseRunnerMessage', () => {
  const valid = {
    type: 'result',
    runId: 'r1',
    logs: [{ level: 'log', text: 'oi' }],
    error: null,
    tests: [{ id: 't1', passed: true, message: '' }],
  };

  it('accepts a well-formed result of the expected run', () => {
    expect(parseRunnerMessage(valid, 'r1')).toEqual({
      logs: [{ level: 'log', text: 'oi' }],
      error: null,
      tests: [{ id: 't1', passed: true, message: '' }],
    });
  });

  it.each([
    ['another run', { ...valid, runId: 'r2' }],
    ['wrong type', { ...valid, type: 'run' }],
    ['bad log level', { ...valid, logs: [{ level: 'alert', text: 'x' }] }],
    ['passed as string', { ...valid, tests: [{ id: 't', passed: 'true', message: '' }] }],
    ['malformed error', { ...valid, error: 'boom' }],
    ['not an object', 'result'],
  ])('rejects %s', (_label, data) => {
    expect(parseRunnerMessage(data, 'r1')).toBeNull();
  });

  it('limits the amount and size of data', () => {
    const report = parseRunnerMessage(
      {
        ...valid,
        logs: Array.from({ length: 500 }, () => ({ level: 'log', text: 'x'.repeat(5000) })),
      },
      'r1',
    )!;

    expect(report.logs).toHaveLength(LIMITS.logs);
    expect(report.logs[0].text.length).toBeLessThan(2100);
  });
});

describe('evaluateCodeRun', () => {
  const exercise = {
    id: 'ex',
    kind: 'code',
    tests: [
      { id: 'a', description: 'Soma números pares', source: '' },
      { id: 'b', description: 'Lista vazia retorna 0', source: '' },
    ],
  } as unknown as CodeExercise;

  it('is correct only when every test of the exercise passed', () => {
    const result = evaluateCodeRun(exercise, {
      status: 'completed',
      durationMs: 5,
      report: {
        logs: [],
        error: null,
        tests: [
          { id: 'a', passed: true, message: '' },
          { id: 'b', passed: true, message: '' },
        ],
      },
    });

    expect(result).toMatchObject({
      correct: true,
      score: 1,
      summary: 'Todos os 2 testes passaram.',
    });
  });

  it('explains each failing test and missing results', () => {
    const result = evaluateCodeRun(exercise, {
      status: 'completed',
      durationMs: 5,
      report: {
        logs: [],
        error: null,
        tests: [{ id: 'a', passed: false, message: 'Esperado 6, recebido 4.' }],
      },
    });

    expect(result.correct).toBe(false);
    expect(result.feedback.map((f) => f.text)).toEqual([
      'Soma números pares — Esperado 6, recebido 4.',
      'Lista vazia retorna 0 — o teste não chegou a rodar.',
    ]);
  });

  it('explains a timeout without pretending anything ran', () => {
    const result = evaluateCodeRun(exercise, { status: 'timeout', timeoutMs: 3000 });

    expect(result).toMatchObject({ correct: false, summary: 'Tempo esgotado.' });
    expect(result.feedback[0].text).toContain('laço que nunca termina');
  });
});

describe('buildPreviewDocument', () => {
  const nonce = 'abcdefghijklmnopqrstuvwx';
  const doc = buildPreviewDocument({
    html: '<h1>Oi</h1><script>alert(1)</script>',
    nonce,
    runId: 'run-1',
    tests: [{ id: 't', source: "expect(document.querySelector('h1')).toBeTruthy();" }],
  });

  it('blocks network and the student scripts through CSP, allowing only the runner nonce', () => {
    expect(doc).toContain("default-src 'none'");
    expect(doc).toContain(`script-src 'nonce-${nonce}' 'unsafe-eval'`);
    expect(doc).not.toContain("'unsafe-inline' 'nonce");
    expect(doc.indexOf(`<script nonce="${nonce}">`)).toBeLessThan(doc.indexOf('<h1>Oi</h1>'));
  });

  it('escapes test data so it cannot close the runner script', () => {
    const tricky = buildPreviewDocument({
      html: '',
      nonce,
      runId: 'r',
      tests: [{ id: 't', source: "'</script><script>alert(1)</script>'" }],
    });

    expect(tricky.match(/<\/script>/g)).toHaveLength(1);
  });

  it('rejects a weak nonce', () => {
    expect(() => buildPreviewDocument({ html: '', nonce: 'x', runId: 'r', tests: [] })).toThrow();
  });
});
