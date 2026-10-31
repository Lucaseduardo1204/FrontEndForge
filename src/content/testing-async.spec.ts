import ts from 'typescript';
import { vi } from 'vitest';
import {
  ASYNC_TIMER_TEST_TS,
  DEBOUNCE_TEST_TS,
  SYSTEM_TIME_TEST_TS,
} from './lessons/testing-async-01';

/**
 * The tests of lesson "testing-async-01", run as they are shown (drift guard at the end), plus
 * the measurements the lesson quotes that can live inside a passing suite.
 */
function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let id: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

function agendarRascunho(texto: string, salvar: (t: string) => Promise<void>) {
  setTimeout(() => void salvar(texto), 2000);
}

function estaVencida(revisao: { venceEm: Date }): boolean {
  return Date.now() >= revisao.venceEm.getTime();
}

describe('testing-async-01: the lesson tests', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('chama a busca uma vez, 300 ms depois da última tecla', () => {
    vi.useFakeTimers();
    const buscar = vi.fn();
    const digitar = debounce(buscar, 300);

    digitar('a');
    vi.advanceTimersByTime(100);
    digitar('ab');
    vi.advanceTimersByTime(100);
    digitar('abc');

    vi.advanceTimersByTime(299);
    expect(buscar).not.toHaveBeenCalled(); // ainda não

    vi.advanceTimersByTime(1);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar).toHaveBeenCalledWith('abc');
    vi.useRealTimers();
  });

  it('salva o rascunho depois de 2 s, inclusive o que vem depois do await', async () => {
    vi.useFakeTimers();
    const salvos: string[] = [];
    agendarRascunho('texto', async (t) => {
      await Promise.resolve(); // como uma gravação assíncrona
      salvos.push(t);
    });

    vi.advanceTimersByTime(2000);
    expect(salvos).toEqual([]); // o timer rodou, o que vem depois do await ainda não

    await vi.advanceTimersByTimeAsync(0);
    expect(salvos).toEqual(['texto']);
    vi.useRealTimers();
  });

  it('marca a revisão como vencida no dia seguinte', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
    const revisao = { venceEm: new Date('2026-02-01T00:00:00Z') };

    expect(estaVencida(revisao)).toBe(false);
    vi.advanceTimersByTime(24 * 60 * 60 * 1000); // Date.now() avança junto
    expect(estaVencida(revisao)).toBe(true);
    vi.useRealTimers();
  });
});

describe('testing-async-01: measurements quoted in the lesson', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Date.now() advances with the fake timers', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
    const t0 = Date.now();
    vi.advanceTimersByTime(60_000);
    expect(Date.now() - t0).toBe(60_000);
  });

  it('setInterval runs 3 times in 3500 ms and stays scheduled', () => {
    vi.useFakeTimers();
    const tick = vi.fn();
    const id = setInterval(tick, 1000);
    vi.advanceTimersByTime(3500);
    expect(tick).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(1);
    clearInterval(id);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a real 300 ms wait costs at least 300 ms', async () => {
    const t0 = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(performance.now() - t0).toBeGreaterThanOrEqual(295);
  });
});

describe('testing-async-01: drift guard', () => {
  it('every line of the three lesson tests is in this spec', () => {
    const spec = ts.sys.readFile('src/content/testing-async.spec.ts') ?? '';
    const lines = [DEBOUNCE_TEST_TS, ASYNC_TIMER_TEST_TS, SYSTEM_TIME_TEST_TS]
      .flatMap((t) => t.split('\n'))
      .map((l) => l.trim())
      .filter(Boolean);

    expect(lines.filter((l) => !spec.includes(l))).toEqual([]);
  });
});
