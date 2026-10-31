import { Lesson } from '../../app/core/models/content.models';

/** Executed in `src/content/closures-examples.spec.ts`; every value in the comments is asserted. */
export const KEY_ORDER_JS = `const estoque = { b: 1, 2: 'x', a: 1, 1: 'y', '-1': 'z', '10': 'w' };
console.log(Object.keys(estoque).join(' ')); // 1 2 10 b a -1: chaves inteiras primeiro, em ordem

const mapa = new Map([['b', 1], [2, 'x'], ['a', 1], [1, 'y']]);
console.log([...mapa.keys()].join(' '));      // b 2 a 1: ordem de inserção`;

export const SET_JS = `console.log(new Set([1, '1', NaN, NaN, 0, -0]).size); // 4: 1, '1', NaN, 0
console.log(new Set([{ id: 1 }, { id: 1 }]).size);     // 2: objetos são comparados pela referência

const visitas = ['ana', 'bia', 'ana', 'caio', 'bia'];
console.log([...new Set(visitas)].join(','));          // ana,bia,caio`;

export const DEFAULTS_JS = `const { tema = 'escuro', fonte = 16, idioma = 'pt-BR' } = { tema: undefined, fonte: null, idioma: '' };
console.log(tema, fonte, JSON.stringify(idioma)); // escuro null "": só undefined usa o padrão

const usuario = {};
const chave = { id: 7 };
usuario[chave] = 'objeto como chave';
console.log(Object.keys(usuario)[0]);              // [object Object]: a chave virou texto

const porUsuario = new Map([[chave, 'objeto como chave']]);
console.log(porUsuario.get(chave), porUsuario.get({ id: 7 })); // objeto como chave undefined`;

export const JS_COLLECTIONS_01: Lesson = {
  id: 'js-collections-01',
  moduleId: 'js-collections-module',
  title: 'Objetos, Map e Set: escolher a coleção certa',
  summary:
    'Quando um objeto serve de dicionário e quando não serve, o que Map e Set resolvem, e as regras de ordem, igualdade e valores padrão que surpreendem.',
  estimatedMinutes: 35,
  difficulty: 'introductory',
  conceptIds: ['js-objects', 'js-collections'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma lista de produtos que aparece fora da ordem cadastrada porque os códigos são números, um cache que nunca encontra nada porque a chave era um objeto, uma configuração com fonte 0 trocada pelo padrão: todos vêm de usar a coleção errada ou de não conhecer as regras dela. Escolher entre objeto, array, Map e Set é uma decisão diária.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Saber em que ordem as chaves de um objeto aparecem.',
            'Usar Map para dicionários com chaves arbitrárias e ordem garantida.',
            'Usar Set para unicidade e pertinência.',
            'Entender quando o valor padrão da desestruturação se aplica.',
            'Evitar armadilhas de chaves especiais e objetos como chave.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Ficha, arquivo e lista de presença',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um objeto é uma ficha com campos conhecidos (nome, e-mail). Um Map é um arquivo de pastas, em que qualquer coisa pode ser a etiqueta e as pastas ficam na ordem em que foram guardadas. Um Set é uma lista de presença: cada nome aparece uma vez, e a pergunta principal é "está aqui?".',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Regras de cada coleção',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Objetos são ótimos para registros com campos conhecidos. Como dicionário, têm limites: chaves viram texto, e a ordem não é só a de inserção.',
            'Medido no Node: chaves que parecem inteiros não negativos ("1", "2", "10") vêm primeiro, em ordem crescente; as demais, na ordem de inserção. "-1" conta como texto comum. Uma lista indexada por código numérico perde a ordem cadastrada.',
            'Usar um objeto como chave de outro objeto transforma a chave no texto "[object Object]": todas as chaves-objeto colidem.',
            'Atribuir obj["__proto__"] não cria uma chave própria (medido: Object.keys continuou vazio); ele mexe no protótipo. Dados vindos de fora usados como chave pedem Map.',
            'Map aceita qualquer valor como chave (inclusive objetos, comparados pela referência), mantém a ordem de inserção e tem size, has, get, set e delete.',
            'Set guarda valores únicos pela comparação SameValueZero: 1 e "1" são diferentes, NaN é igual a NaN, 0 e -0 são iguais, e objetos são comparados pela referência.',
            'Valores padrão na desestruturação (e em parâmetros) só se aplicam quando o valor é undefined. null, 0, "" e false continuam como estão: a mesma diferença entre ?? e || da lição de tipos.',
            'Object.groupBy e Map.groupBy agrupam listas (disponíveis nos navegadores atuais e no Node usado aqui). Em TypeScript, os tipos exigem lib ES2024 ou posterior: neste projeto, o compilador acusou TS2550 ao usar Object.groupBy.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: estoque, visitas e preferências',
      blocks: [
        { type: 'code', language: 'javascript', caption: 'ordem.js', code: KEY_ORDER_JS },
        { type: 'code', language: 'javascript', caption: 'unicos.js', code: SET_JS },
        { type: 'code', language: 'javascript', caption: 'padroes.js', code: DEFAULTS_JS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma executam os três exemplos e conferem cada valor dos comentários.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no console',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Crie um objeto com as chaves "300", "20", "x", "1" e veja a ordem de Object.keys.',
            'Compare new Set([[1], [1]]).size com new Set([1, 1]).size.',
            'Use Object.groupBy para agrupar uma lista de produtos por categoria.',
            'Desestruture { limite = 10 } de { limite: 0 } e de {} e compare.',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [
        {
          type: 'paragraph',
          text: 'No laboratório, limpe uma lista de contatos com Set e Map: sem duplicados e com contagem por domínio. Depois, escolha a coleção certa.',
        },
      ],
      exerciseIds: ['lab-js-contacts', 'collections-01-choose'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o catálogo fora de ordem',
      blocks: [
        {
          type: 'code',
          language: 'javascript',
          caption:
            'Os produtos foram cadastrados como 300, 20, 1001, mas a tela mostra 20, 300, 1001',
          code: `const catalogo = {};
for (const p of produtosNaOrdemCadastrada) catalogo[p.codigo] = p;

for (const codigo of Object.keys(catalogo)) render(catalogo[codigo]);`,
        },
      ],
      exerciseIds: ['collections-01-order'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Nesta plataforma, o progresso guarda registros por id em objetos (chaves são ids de texto como "js-closures-01"), e o catálogo de conteúdo usa arrays quando a ordem importa.',
            'Caches em memória são Maps: chave arbitrária, tamanho fácil de medir, remoção simples.',
            'Set é a forma mais clara de "já vi este id?" num laço.',
          ],
        },
      ],
    },
    {
      kind: 'assessment',
      title: 'Avaliação',
      blocks: [
        { type: 'paragraph', text: 'Para concluir a lição, acerte os três exercícios abaixo.' },
      ],
      exerciseIds: ['collections-01-default', 'collections-01-set', 'collections-01-object-key'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Objeto: registro com campos conhecidos. Map: dicionário de chaves arbitrárias.',
            'Chaves inteiras em objetos vêm primeiro, em ordem crescente.',
            'Set: valores únicos; objetos pela referência.',
            'Padrão na desestruturação só para undefined.',
            'Objeto como chave de objeto vira "[object Object]".',
          ],
        },
      ],
    },
  ],
};
