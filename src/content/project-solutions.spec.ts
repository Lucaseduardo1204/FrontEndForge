import { WORKER_RUNNER_SOURCE } from '../app/core/lab/runner-source';
import { PROJECT_CAPSTONE_ADMIN } from './projects/project-capstone-admin';
import { PROJECT_HTML_PROFILE } from './projects/project-html-profile';
import { PROJECT_JS_TASKS } from './projects/project-js-tasks';

/**
 * Reference solutions live only here (never in the shipped content): they prove that the
 * project checks can be passed, and that typical mistakes are caught for the right reason.
 */

const HTML_REFERENCE = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Portfólio de Ana, desenvolvedora frontend">
  <title>Ana Souza · Frontend</title>
  <style>
    :root { --space: 1rem; }
    main { padding: var(--space); }
    @media (min-width: 48rem) { main { max-width: 60rem; margin: 0 auto; } }
  </style>
</head>
<body>
  <header>
    <h1>Ana Souza</h1>
    <nav><ul><li><a href="#sobre">Sobre</a></li><li><a href="#contato">Contato</a></li></ul></nav>
  </header>
  <main>
    <section id="sobre"><h2>Sobre</h2><p>Estudo frontend.</p><img src="ana.jpg" alt="Ana sorrindo"></section>
    <section id="projetos"><h2>Projetos</h2>
      <article><h3>Lista de tarefas</h3><a href="https://example.com" target="_blank" rel="noopener noreferrer">Ver</a></article>
    </section>
    <section id="contato"><h2>Contato</h2>
      <form>
        <label for="nome">Nome</label><input id="nome" name="nome" required>
        <label>E-mail <input type="email" name="email" required></label>
        <label for="msg">Mensagem</label><textarea id="msg" name="msg"></textarea>
        <button type="submit">Enviar</button>
      </form>
    </section>
  </main>
  <footer><a href="https://github.com/ana">GitHub</a></footer>
</body>
</html>`;

/** Runs the HTML check tests against the test DOM (same "document + source" contract). */
function runHtml(source: string): Record<string, string | true> {
  document.body.innerHTML = source;
  const results: Record<string, string | true> = {};
  const expect = (actual: unknown) => ({
    toBe: (expected: unknown) => {
      if (!Object.is(actual, expected)) throw new Error(`Esperado ${expected}, recebido ${actual}`);
    },
    toEqual: (expected: unknown) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Esperado ${JSON.stringify(expected)}, recebido ${JSON.stringify(actual)}`);
      }
    },
  });
  for (const test of PROJECT_HTML_PROFILE.autoCheck.tests) {
    try {
      new Function('expect', 'document', 'window', 'source', test.source)(
        expect,
        document,
        window,
        source,
      );
      results[test.id] = true;
    } catch (e) {
      results[test.id] = (e as Error).message;
    }
  }
  return results;
}

async function runJs(
  code: string,
  tests = PROJECT_JS_TASKS.autoCheck.tests,
): Promise<Record<string, string | true>> {
  const posted: { tests: { id: string; passed: boolean; message: string }[] }[] = [];
  const scope = {
    onmessage: null as null | ((e: unknown) => Promise<void>),
    postMessage: (m: never) => posted.push(m),
  };
  new Function('self', WORKER_RUNNER_SOURCE)(scope);
  await scope.onmessage!({
    data: { type: 'run', runId: 'r', code, tests },
  });
  return Object.fromEntries(posted[0].tests.map((t) => [t.id, t.passed || t.message]));
}

const JS_REFERENCE = `
let proximoId = 1;
function adicionarTarefa(tarefas, titulo) {
  const limpo = titulo.trim();
  if (!limpo) throw new Error('O título não pode ficar vazio.');
  return [...tarefas, { id: proximoId++, titulo: limpo, concluida: false }];
}
function alternarConcluida(tarefas, id) {
  return tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t));
}
function removerTarefa(tarefas, id) { return tarefas.filter((t) => t.id !== id); }
function filtrarTarefas(tarefas, filtro) {
  if (filtro === 'pendentes') return tarefas.filter((t) => !t.concluida);
  if (filtro === 'concluidas') return tarefas.filter((t) => t.concluida);
  return tarefas;
}
function contarPendentes(tarefas) { return tarefas.filter((t) => !t.concluida).length; }
`;

describe('project checks', () => {
  it('HTML: the reference page passes every check', () => {
    const results = runHtml(HTML_REFERENCE);

    expect(Object.entries(results).filter(([, r]) => r !== true)).toEqual([]);
  });

  it('HTML: the starter code fails, explaining what is missing', () => {
    const results = runHtml(PROJECT_HTML_PROFILE.autoCheck.starterCode);

    expect(results['doctype']).toBe(true);
    expect(results['lang']).toBe(true);
    expect(results['title']).toContain('<title> vazio ou ausente');
    expect(results['landmarks']).toContain('header');
  });

  it('HTML: catches common accessibility and security mistakes', () => {
    const broken = HTML_REFERENCE.replace(' rel="noopener noreferrer"', '')
      .replace('<label for="nome">Nome</label>', '')
      .replace('<h3>Lista de tarefas</h3>', '<h4>Lista de tarefas</h4>')
      .replace('<button type="submit">', '<button type="submit" onclick="enviar()">');

    const results = runHtml(broken);

    expect(results['noopener']).toContain('https://example.com');
    expect(results['form-labels']).toContain('<input name=nome>');
    expect(results['headings']).toContain('h2 → h4');
    expect(results['no-inline-js']).toContain('onclick');
  });

  it('JS: the reference logic passes every check', async () => {
    const results = await runJs(JS_REFERENCE);

    expect(Object.entries(results).filter(([, r]) => r !== true)).toEqual([]);
  });

  it('JS: catches ids based on the list length (duplicates after removal)', async () => {
    const lengthIds = JS_REFERENCE.replace('id: proximoId++', 'id: tarefas.length + 1');

    const results = await runJs(lengthIds);

    expect(results['unique-ids']).not.toBe(true);
    expect(results['add']).toBe(true);
  });

  it('JS: catches mutation of the received list', async () => {
    const mutating = JS_REFERENCE.replace(
      'return [...tarefas, { id: proximoId++, titulo: limpo, concluida: false }];',
      'tarefas.push({ id: proximoId++, titulo: limpo, concluida: false }); return tarefas;',
    );

    const results = await runJs(mutating);

    expect(results['add-immutable']).not.toBe(true);
  });

  it('JS: the starter code fails', async () => {
    const results = await runJs(PROJECT_JS_TASKS.autoCheck.starterCode);

    expect(Object.values(results).some((r) => r !== true)).toBe(true);
  });

  describe('capstone: table query', () => {
    const CAPSTONE_REFERENCE = `
function consultarTabela(registros, consulta = {}) {
  const { busca = '', status = 'todos', pagina = 1, porPagina = 10 } = consulta;
  const termo = busca.trim().toLowerCase();
  const filtrados = registros.filter(
    (r) =>
      (status === 'todos' || r.status === status) &&
      (termo === '' || r.nome.toLowerCase().includes(termo) || r.email.toLowerCase().includes(termo)),
  );
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const atual = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (atual - 1) * porPagina;
  return {
    itens: filtrados.slice(inicio, inicio + porPagina),
    total: filtrados.length,
    pagina: atual,
    totalPaginas,
  };
}`;
    const tests = PROJECT_CAPSTONE_ADMIN.autoCheck.tests;

    it('the reference solution passes every check', async () => {
      const results = await runJs(CAPSTONE_REFERENCE, tests);

      expect(Object.entries(results).filter(([, r]) => r !== true)).toEqual([]);
    });

    it('catches a page that is not clamped to the valid range', async () => {
      const noClamp = CAPSTONE_REFERENCE.replace(
        'const atual = Math.min(Math.max(1, pagina), totalPaginas);',
        'const atual = pagina;',
      );

      const results = await runJs(noClamp, tests);

      expect(results['clamp']).not.toBe(true);
      expect(results['pagination']).toBe(true);
    });

    it('catches sorting the received records in place', async () => {
      const sortsInPlace = CAPSTONE_REFERENCE.replace(
        'const filtrados = registros.filter(',
        'registros.sort((a, b) => a.id - b.id);\n  const filtrados = registros.filter(',
      );

      const results = await runJs(sortsInPlace, tests);

      expect(results['immutable']).not.toBe(true);
    });

    it('the starter code fails', async () => {
      const results = await runJs(PROJECT_CAPSTONE_ADMIN.autoCheck.starterCode, tests);

      expect(Object.values(results).some((r) => r !== true)).toBe(true);
    });
  });
});
