import { PREDICT_CASCADE_CODE } from './exercises/css-cascade-01.exercises';
import { FINALLY_JS, ORDER_PREDICT_JS } from './exercises/js-async-01.exercises';
import { INHERITANCE_CSS, MENU_CSS_BUG, MENU_CSS_FIX, MENU_HTML } from './lessons/css-cascade-01';
import {
  EVENT_LOOP_JS,
  LOAD_PRODUCTS_JS,
  PARALLEL_JS,
  RACE_BUG_JS,
  RACE_FIX_JS,
} from './lessons/js-async-01';

/**
 * Executes the examples of lessons "css-cascade-01" (computed styles, jsdom) and
 * "js-async-01" (real timers). Also checked in a real browser (D-051).
 */

describe('cascade examples (computed styles)', () => {
  const color = (selector: string) => getComputedStyle(document.querySelector(selector)!).color;

  it('the id rule beats the later class rule; equal specificity lets order decide', () => {
    document.body.innerHTML = `<style>${MENU_CSS_BUG}</style>${MENU_HTML}`;
    expect(color('.link--ativo')).toBe('rgb(128, 128, 128)'); // gray

    document.body.innerHTML = `<style>${MENU_CSS_FIX}</style>${MENU_HTML}`;
    expect(color('.link--ativo')).toBe('rgb(65, 105, 225)'); // royalblue
    expect(color('.link:not(.link--ativo)')).toBe('rgb(128, 128, 128)');
  });

  it('color and font-family are inherited; border and padding are not', () => {
    document.body.innerHTML = `<style>${INHERITANCE_CSS}</style><div class="cartao"><p>texto</p></div>`;
    const p = getComputedStyle(document.querySelector('p')!);

    expect(p.color).toBe('rgb(29, 78, 216)');
    expect(p.fontFamily).toContain('Georgia');
    expect(p.borderTopStyle).not.toBe('solid');
    expect(p.paddingTop).not.toBe('1rem');
  });

  it('css-01-predict: the text is green', () => {
    document.body.innerHTML = PREDICT_CASCADE_CODE;
    expect(color('.aviso')).toBe('rgb(0, 128, 0)');
  });
});

/** Runs code with a captured console; returns the logs once timers have fired. */
async function runLogged(code: string): Promise<string[]> {
  const logs: string[] = [];
  new Function('console', code)({ log: (...a: unknown[]) => logs.push(a.join(' ')) });
  await new Promise((resolve) => setTimeout(resolve, 20));
  return logs;
}

const AsyncFunction = Object.getPrototypeOf(async () => undefined).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('async examples (real timers)', () => {
  it('event loop: synchronous, then microtasks, then the setTimeout task', async () => {
    expect(await runLogged(EVENT_LOOP_JS)).toEqual([
      '1: síncrono',
      '2: síncrono',
      '3: microtarefa (then)',
      '4: tarefa (setTimeout)',
    ]);
  });

  it('js-async-01-order: A D F C E B', async () => {
    expect((await runLogged(ORDER_PREDICT_JS)).join(' ')).toBe('A D F C E B');
  });

  describe('carregarProdutos', () => {
    const load = new AsyncFunction(
      'buscar',
      'mostrar',
      `${LOAD_PRODUCTS_JS}\nreturn carregarProdutos(buscar, mostrar);`,
    );
    const states = async (buscar: unknown) => {
      const seen: unknown[] = [];
      await load(buscar, (s: unknown) => seen.push(s));
      return seen;
    };

    it('loading then success', async () => {
      expect(
        await states(async () => ({ ok: true, status: 200, json: async () => [{ id: 1 }] })),
      ).toEqual([{ status: 'carregando' }, { status: 'sucesso', produtos: [{ id: 1 }] }]);
    });

    it('a 404 response (which fetch resolves) becomes an error', async () => {
      expect(
        await states(async () => ({ ok: false, status: 404, json: async () => ({}) })),
      ).toEqual([{ status: 'carregando' }, { status: 'erro', mensagem: 'HTTP 404' }]);
    });

    it('a network failure becomes an error with its message', async () => {
      const seen = await states(async () => {
        throw new TypeError('Failed to fetch');
      });
      expect(seen.at(-1)).toEqual({ status: 'erro', mensagem: 'Failed to fetch' });
    });
  });

  it('sequential awaits start the second call only after the first; Promise.all starts both at once', async () => {
    const run = new AsyncFunction('buscarUsuario', 'buscarPedidos', PARALLEL_JS);
    const starts: number[] = [];
    const slow = (value: string) => async () => {
      starts.push(performance.now()); // when each request starts
      await wait(100);
      return value;
    };

    await run(slow('u'), slow('p'));

    // starts = [user, orders] in sequence, then [user, orders] in parallel.
    expect(starts).toHaveLength(4);
    expect(starts[1] - starts[0]).toBeGreaterThanOrEqual(95); // waited for the first one
    expect(starts[3] - starts[2]).toBeLessThan(20); // started together
  });

  it('race: without the guard the stale answer wins; with it, the latest search is shown', async () => {
    // "ca" is slower than "café": its answer arrives last.
    const buscar = async (termo: string) => {
      await wait(termo === 'ca' ? 60 : 10);
      return `sugestões de ${termo}`;
    };
    for (const [code, expected] of [
      [RACE_BUG_JS, 'sugestões de ca'],
      [RACE_FIX_JS, 'sugestões de café'],
    ]) {
      const search = new Function(`${code}\nreturn buscarSugestoes;`)() as (
        termo: string,
        buscar: unknown,
        mostrar: (r: string) => void,
      ) => Promise<void>;
      let shown = '';
      await Promise.all([
        search('ca', buscar, (r) => (shown = r)),
        search('café', buscar, (r) => (shown = r)),
      ]);
      expect(shown).toBe(expected);
    }
  });

  it('js-async-01-finally: loading is cleared on success and on failure, even after return', async () => {
    const salvar = new Function(`${FINALLY_JS}\nreturn salvar;`)() as (
      enviar: () => Promise<void>,
      ui: { carregando: boolean },
    ) => Promise<string>;

    for (const [enviar, result] of [
      [async () => undefined, 'salvo'],
      [async () => Promise.reject(new Error('x')), 'falhou'],
    ] as const) {
      const ui = { carregando: false };
      const pending = salvar(enviar, ui);
      expect(ui.carregando).toBe(true);
      expect(await pending).toBe(result);
      expect(ui.carregando).toBe(false);
    }
  });
});
