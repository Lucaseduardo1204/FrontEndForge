import { TestBed } from '@angular/core/testing';
import { CodeRunnerService, RUNNER_WORKER_FACTORY, RunnerWorker } from './code-runner.service';
import { RunRequest } from './lab-protocol';

class FakeWorker implements RunnerWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  received: RunRequest | null = null;
  terminated = false;

  postMessage(message: unknown): void {
    this.received = message as RunRequest;
  }

  terminate(): void {
    this.terminated = true;
  }

  reply(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent);
  }
}

describe('CodeRunnerService', () => {
  let worker: FakeWorker;
  let service: CodeRunnerService;

  function setup(factory: () => RunnerWorker = () => worker): void {
    worker = new FakeWorker();
    TestBed.configureTestingModule({
      providers: [{ provide: RUNNER_WORKER_FACTORY, useValue: factory }],
    });
    service = TestBed.inject(CodeRunnerService);
  }

  afterEach(() => vi.useRealTimers());

  it('sends code and tests, returns the validated report and destroys the worker', async () => {
    setup();
    const promise = service.runJavaScript('console.log(1)', [{ id: 't', source: 'x' }]);
    const runId = worker.received!.runId;

    worker.reply({
      type: 'result',
      runId,
      logs: [{ level: 'log', text: '1' }],
      error: null,
      tests: [],
    });
    const result = await promise;

    expect(worker.received).toMatchObject({ type: 'run', code: 'console.log(1)' });
    expect(result).toMatchObject({ status: 'completed', report: { logs: [{ text: '1' }] } });
    expect(worker.terminated).toBe(true);
  });

  it('ignores forged or malformed messages', async () => {
    vi.useFakeTimers();
    setup();
    const promise = service.runJavaScript('x', [], 1000);

    worker.reply({ type: 'result', runId: 'forged', logs: [], error: null, tests: [] });
    worker.reply('tudo passou');
    vi.advanceTimersByTime(1000);

    expect((await promise).status).toBe('timeout');
  });

  it('terminates the worker when time runs out (infinite loop)', async () => {
    vi.useFakeTimers();
    setup();
    const promise = service.runJavaScript('while (true) {}', [], 2000);

    vi.advanceTimersByTime(1999);
    expect(worker.terminated).toBe(false);
    vi.advanceTimersByTime(1);

    expect(await promise).toEqual({ status: 'timeout', timeoutMs: 2000 });
    expect(worker.terminated).toBe(true);
  });

  it('reports when the isolated environment cannot be created', async () => {
    setup(() => {
      throw new Error('blocked');
    });

    expect((await service.runJavaScript('x', [])).status).toBe('unavailable');
  });
});
