import { STALE_JS, TDZ_JS } from './exercises/js-closures-01.exercises';
import { COUNTER_FACTORY_JS, LIVE_BINDING_JS, LOOP_JS } from './lessons/js-closures-01';
import { JS_CLOSURES_01_EXERCISES } from './exercises/js-closures-01.exercises';
import { PIPE_ORDER_JS } from './exercises/js-functional-01.exercises';
import { TYPES_PREDICT_JS } from './exercises/js-types-01.exercises';
import { FINALLY_PREDICT_JS } from './exercises/js-errors-01.exercises';
import { ORIGIN_JS, RELATIVE_JS, URL_PARTS_JS } from './lessons/web-url-01';
import { DEFAULTS_JS, KEY_ORDER_JS, SET_JS } from './lessons/js-collections-01';
import { CAUSE_JS, CUSTOM_ERROR_JS, FINALLY_JS } from './lessons/js-errors-01';
import { COERCION_JS, NUMBERS_JS, PARSING_JS } from './lessons/js-types-01';
import { PIPE_JS, SHALLOW_COPY_JS, SORT_JS } from './lessons/js-functional-01';

/** Runs the examples of lesson "js-closures-01" and checks what the lesson says they print. */
function run(code: string): { logs: string[]; error?: Error } {
  const logs: string[] = [];
  try {
    new Function('console', code)({ log: (...a: unknown[]) => logs.push(a.map(String).join(' ')) });
    return { logs };
  } catch (error) {
    return { logs, error: error as Error };
  }
}

describe('closure examples of the lesson', () => {
  it('independent counters with private state: 2 11, and no "valor" property', () => {
    expect(run(COUNTER_FACTORY_JS).logs).toEqual(['2 11', 'undefined']);
  });

  it('a closure sees later changes to the variable: tchau', () => {
    expect(run(LIVE_BINDING_JS).logs).toEqual(['tchau']);
  });

  it('var shares one variable across the loop; let creates one per iteration', () => {
    expect(run(LOOP_JS).logs).toEqual(['3,3,3 0,1,2']);
  });

  it('closures-01-stale: destructuring copies the value: escuro claro', () => {
    expect(run(STALE_JS).logs).toEqual(['escuro claro']);
  });

  it('closures-01-tdz: using a let before its declaration throws ReferenceError', () => {
    const { logs, error } = run(TDZ_JS);

    expect(logs).toEqual([]);
    expect(error).toBeInstanceOf(ReferenceError);
    expect(error!.message).toContain('before initialization');
  });

  it('closures-01-counters: 2 6, using the lesson factory', () => {
    const exercise = JS_CLOSURES_01_EXERCISES.find((e) => e.id === 'closures-01-counters')!;
    const code = exercise.kind === 'predict-output' ? exercise.code : '';
    const factory = COUNTER_FACTORY_JS.slice(0, COUNTER_FACTORY_JS.indexOf('const visitas'));

    expect(run(`${factory}\n${code}`).logs).toEqual(['2 6']);
  });
});

describe('functional examples of the lesson js-functional-01', () => {
  it('spread shares the nested object; structuredClone does not', () => {
    expect(run(SHALLOW_COPY_JS).logs).toEqual(['Bia', '1']);
  });

  it('toSorted returns a new array; sort changes the original', () => {
    expect(run(SORT_JS).logs).toEqual(['30,10,20 10,20,30', '10,20,30']);
  });

  it('pipe normalizes the search: cafe com pao', () => {
    expect(run(PIPE_JS).logs).toEqual(['cafe com pao']);
  });

  it('functional-01-pipe-order: 13 16', () => {
    expect(run(PIPE_ORDER_JS).logs).toEqual(['13 16']);
  });

  it('functional-01-sort: sorting a frozen array throws TypeError', () => {
    expect(run(`'use strict'; Object.freeze([3, 1, 2]).sort();`).error).toBeInstanceOf(TypeError);
    expect(run(`Object.freeze([3, 1, 2]).sort();`).error).toBeInstanceOf(TypeError);
  });
});

describe('type and number examples of the lesson js-types-01', () => {
  it('coercion: concatenation, loose equality, NaN and typeof', () => {
    expect(run(COERCION_JS).logs).toEqual([
      '12 12 2',
      'true true false',
      'false true',
      'object object true',
    ]);
  });

  it('floating point: 0.1 + 0.2, 19.9 * 3, cents, toFixed', () => {
    expect(run(NUMBERS_JS).logs).toEqual([
      '0.30000000000000004',
      '59.699999999999996',
      '59.7',
      '1.00',
    ]);
  });

  it('parsing input and choosing defaults', () => {
    expect(run(PARSING_JS).logs).toEqual(['0 12 NaN', '12 1', '10 0', 'padrão padrão']);
  });

  it('types-01-predict: 10 0 0 51', () => {
    expect(run(TYPES_PREDICT_JS).logs).toEqual(['10 0 0 51']);
  });

  it('claims in the exercises: isNaN(""), parseInt leniency, Intl non-breaking space', () => {
    expect(isNaN('' as unknown as number)).toBe(false);
    expect([parseInt(''), parseInt('2abc'), parseInt('1.5')]).toEqual([NaN, 2, 1]);
    expect(Math.round(1.005 * 100)).toBe(100);
    const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      1234.5,
    );
    expect(brl).toBe('R$\u00a01.234,50');
    expect(brl === 'R$ 1.234,50').toBe(false);
  });
});

describe('error examples of the lesson js-errors-01', () => {
  it('finally runs after the return of the catch', () => {
    expect(run(FINALLY_JS).logs).toEqual(['tentar → tratar: disco cheio → liberar']);
  });

  it('a custom error is recognized with instanceof and keeps its field', () => {
    expect(run(CUSTOM_ERROR_JS).logs).toEqual(['idade | Informe a idade em anos']);
  });

  it('cause keeps the original SyntaxError', () => {
    expect(run(CAUSE_JS).logs).toEqual(['O rascunho salvo está corrompido | SyntaxError']);
  });

  it('errors-01-finally: a return inside finally replaces the return of try', () => {
    expect(run(FINALLY_PREDICT_JS).logs).toEqual(['limpando', 'finally']);
  });

  it('claims: throw of a string has no stack; a subclass without name shows "Error"', () => {
    let capturado: unknown;
    try {
      throw 'texto';
    } catch (e) {
      capturado = e;
    }
    expect(typeof capturado).toBe('string');
    expect(capturado instanceof Error).toBe(false);

    class SemNome extends Error {}
    expect(String(new SemNome('m'))).toBe('Error: m');
  });

  it('claims: try without await does not catch; with await it does; allSettled vs all', async () => {
    const falha = async () => {
      throw new Error('falhou');
    };
    let semAwait = false;
    let pendente: Promise<void> | undefined;
    try {
      pendente = falha();
    } catch {
      semAwait = true;
    }
    await pendente!.catch(() => undefined);
    expect(semAwait).toBe(false);

    let comAwait = false;
    try {
      await falha();
    } catch {
      comAwait = true;
    }
    expect(comAwait).toBe(true);

    const r = await Promise.allSettled([Promise.resolve(1), falha()]);
    expect(r.map((x) => x.status)).toEqual(['fulfilled', 'rejected']);
    await expect(Promise.all([Promise.resolve(1), falha()])).rejects.toThrow('falhou');
  });
});

describe('URL examples of the lesson web-url-01', () => {
  it('parts of a URL, decoded search and origin without the default port', () => {
    expect(run(URL_PARTS_JS).logs).toEqual([
      'https: loja.com /produtos/cafe',
      '?busca=caf%C3%A9&p=2 #avaliacoes',
      'café',
      'https://loja.com',
    ]);
  });

  it('relative links, including the trailing slash difference', () => {
    expect(run(RELATIVE_JS).logs).toEqual([
      'https://loja.com/produtos/cafe/torrado',
      'https://loja.com/produtos/cha',
      'https://loja.com/conta',
      'https://cdn.loja.com/a.js',
      'https://loja.com/produtos/cafe/?ordem=preco',
      'https://loja.com/produtos/torrado',
    ]);
  });

  it('origin is scheme + host + port', () => {
    expect(run(ORIGIN_JS).logs).toEqual(['true', 'false', 'false', 'false']);
  });

  it('claims in the exercises: encoding, concatenation, encodeURI and mailto origin', () => {
    const termo = 'café com leite & pão';
    const params = new URLSearchParams();
    params.set('q', termo);
    expect(params.toString()).toBe('q=caf%C3%A9+com+leite+%26+p%C3%A3o');
    expect([...new URLSearchParams(`q=${termo}`)]).toEqual([
      ['q', 'café com leite '],
      [' pão', ''],
    ]);
    expect(encodeURI(`/busca?q=${termo}`)).toContain('%20&%20');
    expect(new URL('mailto:a@b.com').origin).toBe('null');
  });
});

describe('collection examples of the lesson js-collections-01', () => {
  it('integer-like keys come first in ascending order; Map keeps insertion order', () => {
    expect(run(KEY_ORDER_JS).logs).toEqual(['1 2 10 b a -1', 'b 2 a 1']);
  });

  it('Set uses SameValueZero and compares objects by reference', () => {
    expect(run(SET_JS).logs).toEqual(['4', '2', 'ana,bia,caio']);
  });

  it('defaults only for undefined; an object key becomes "[object Object]"', () => {
    expect(run(DEFAULTS_JS).logs).toEqual([
      'escuro null ""',
      '[object Object]',
      'objeto como chave undefined',
    ]);
  });

  it('claims: __proto__ is not an own key; Map stores it; groupBy exists', () => {
    const dicionario: Record<string, string> = {};
    dicionario['__proto__'] = 'x';
    expect(Object.keys(dicionario)).toEqual([]);
    expect(new Map([['__proto__', 'x']]).size).toBe(1);
    expect(typeof (Object as unknown as { groupBy?: unknown }).groupBy).toBe('function');
  });
});
