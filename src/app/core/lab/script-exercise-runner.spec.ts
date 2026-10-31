import { TestBed } from '@angular/core/testing';
import { CodeExercise } from '../models/content.models';
import { CodeRunnerService, RunnerWorker } from './code-runner.service';
import { ScriptExerciseRunner } from './script-exercise-runner.service';
import { TRANSPILER_WORKER_FACTORY } from './transpiler.service';

/** Fake transpiler worker that answers like the real one (or not at all). */
function transpilerWorker(answer: (source: string) => object | null): RunnerWorker {
  const worker: RunnerWorker = {
    onmessage: null,
    onerror: null,
    postMessage(message) {
      const { id, source } = message as { id: string; source: string };
      const reply = answer(source);
      if (reply)
        queueMicrotask(() => worker.onmessage?.({ data: { id, ...reply } } as MessageEvent));
    },
    terminate: () => undefined,
  };
  return worker;
}

describe('ScriptExerciseRunner', () => {
  const tsExercise = {
    id: 'ts',
    kind: 'code',
    language: 'typescript',
    tests: [],
  } as unknown as CodeExercise;
  const runJavaScript = vi.fn();

  function setup(worker: RunnerWorker): ScriptExerciseRunner {
    runJavaScript.mockReset().mockResolvedValue({ status: 'timeout', timeoutMs: 1 });
    TestBed.configureTestingModule({
      providers: [
        { provide: TRANSPILER_WORKER_FACTORY, useValue: () => worker },
        { provide: CodeRunnerService, useValue: { runJavaScript } },
      ],
    });
    return TestBed.inject(ScriptExerciseRunner);
  }

  afterEach(() => vi.useRealTimers());

  it('runs the transpiled JavaScript', async () => {
    const runner = setup(transpilerWorker(() => ({ ok: true, code: 'const a = 1;' })));

    await runner.run(tsExercise, 'const a: number = 1;');

    expect(runJavaScript).toHaveBeenCalledWith('const a = 1;', []);
  });

  it('reports a syntax error as the student’s compile error', async () => {
    const runner = setup(
      transpilerWorker(() => ({ ok: false, message: 'Unexpected token (1:9)' })),
    );

    const result = await runner.run(tsExercise, 'function (');

    expect(result).toEqual({
      status: 'compile-error',
      message: 'Erro de sintaxe: Unexpected token (1:9)',
    });
    expect(runJavaScript).not.toHaveBeenCalled();
  });

  it('reports a silent transpiler as unavailable, not as the student’s mistake', async () => {
    vi.useFakeTimers();
    const runner = setup(transpilerWorker(() => null));

    const promise = runner.run(tsExercise, 'const a = 1;');
    await vi.advanceTimersByTimeAsync(15000);

    expect((await promise).status).toBe('unavailable');
  });
});
