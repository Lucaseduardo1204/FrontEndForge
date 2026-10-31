import ts from 'typescript';
import { ARCH_DEPS_01_EXERCISES } from './exercises/arch-deps-01.exercises';

/**
 * Architecture test of this repository, as lesson "arch-deps-01" describes: builds the graph
 * of static imports in src/app (tests excluded) and checks the dependency rules.
 */
const APP = 'src/app/';

function normalizar(caminho: string): string {
  const partes: string[] = [];
  for (const parte of caminho.split('/')) {
    if (parte === '..') partes.pop();
    else if (parte !== '.') partes.push(parte);
  }
  return partes.join('/');
}

function montarGrafo(): Record<string, string[]> {
  const arquivos = ts.sys
    .readDirectory(APP, ['.ts'])
    .map((f) => f.slice(f.indexOf(APP)))
    .filter((f) => !f.endsWith('.spec.ts'));
  const existentes = new Set(arquivos);
  const grafo: Record<string, string[]> = {};
  for (const arquivo of arquivos) {
    const fonte = ts.sys.readFile(arquivo) ?? '';
    const pasta = arquivo.slice(0, arquivo.lastIndexOf('/'));
    grafo[arquivo.slice(APP.length)] = [...fonte.matchAll(/from '(\.[^']+)'/g)]
      .map((m) => normalizar(`${pasta}/${m[1]}`))
      .map((alvo) => (existentes.has(`${alvo}.ts`) ? `${alvo}.ts` : `${alvo}/index.ts`))
      .filter((alvo) => existentes.has(alvo))
      .map((alvo) => alvo.slice(APP.length));
  }
  return grafo;
}

/** The lab's reference solution is the detector used here, so the lesson code is the real one. */
function carregarSolucao(): {
  encontrarCiclo: (g: Record<string, string[]>) => string[] | null;
  camada: (arquivo: string) => string;
  violacoes: (g: Record<string, string[]>, p: Record<string, string[]>) => string[];
} {
  const exercicio = ARCH_DEPS_01_EXERCISES.find((e) => e.id === 'lab-js-dependency-rules')!;
  const bloco = exercicio.solution.find((b) => b.type === 'code');
  const codigo = bloco && bloco.type === 'code' ? bloco.code : '';
  return new Function(`${codigo}\nreturn { encontrarCiclo, camada, violacoes };`)();
}

describe('architecture of this repository (lesson arch-deps-01)', () => {
  const grafo = montarGrafo();
  const { encontrarCiclo, camada, violacoes } = carregarSolucao();

  it('reads a real graph', () => {
    expect(Object.keys(grafo).length).toBeGreaterThan(100);
    expect(Object.values(grafo).flat().length).toBeGreaterThan(300);
  });

  it('has no import cycles', () => {
    expect(encontrarCiclo(grafo)).toBeNull();
  });

  it('follows the layer rules; the only feature importing others is focus', () => {
    const permitido = {
      core: [],
      shared: ['core'],
      layout: ['core', 'shared'],
      features: ['core', 'shared'],
    };
    const proibidas = violacoes(grafo, permitido).filter(
      (v) => !(v.startsWith('app.') || v.includes('-> app.')),
    );
    const origens = new Set(proibidas.map((v) => camada(v.split(' -> ')[0])));

    expect([...origens]).toEqual(['features/focus']);
    expect(proibidas.every((v) => /-> features\/(lessons|lab|review|dashboard)\//.test(v))).toBe(
      true,
    );
  });

  it('no feature imports focus back', () => {
    const paraFoco = Object.entries(grafo).filter(
      ([de, para]) =>
        !de.startsWith('features/focus/') && para.some((p) => p.startsWith('features/focus/')),
    );
    expect(paraFoco).toEqual([]);
  });
});
