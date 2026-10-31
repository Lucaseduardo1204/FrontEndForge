import { Lesson } from '../../app/core/models/content.models';

/**
 * Type-checked by the real TypeScript compiler in `src/content/ts-examples.spec.ts`:
 * what the lesson says compiles does compile, and what it says fails reports that error.
 */
export const REQUEST_STATE_TS = `interface Produto {
  id: number;
  nome: string;
  preco: number;
}

type EstadoPedido =
  | { status: 'carregando' }
  | { status: 'sucesso'; produtos: Produto[] }
  | { status: 'erro'; mensagem: string };

function descrever(estado: EstadoPedido): string {
  switch (estado.status) {
    case 'carregando':
      return 'Carregando…';
    case 'sucesso':
      return \`\${estado.produtos.length} produtos\`; // aqui, estado tem produtos
    case 'erro':
      return \`Falhou: \${estado.mensagem}\`; // aqui, estado tem mensagem
    default: {
      // Se um novo status for criado e esquecido aqui, esta linha deixa de compilar.
      const impossivel: never = estado;
      return impossivel;
    }
  }
}`;

export const NO_NARROWING_TS = `function total(estado: EstadoPedido): number {
  return estado.produtos.length; // erro: e se estiver carregando?
}`;

export const TYPE_GUARD_TS = `function ehProduto(valor: unknown): valor is Produto {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'id' in valor && typeof valor.id === 'number' &&
    'nome' in valor && typeof valor.nome === 'string' &&
    'preco' in valor && typeof valor.preco === 'number'
  );
}

const dados: unknown = JSON.parse('{"id": 1, "nome": "Café", "preco": "12"}');

if (ehProduto(dados)) {
  console.log(dados.preco.toFixed(2)); // seguro: preco é number aqui
} else {
  console.log('Resposta inválida da API'); // é o que acontece: preco veio como texto
}`;

export const TS_NARROWING_01: Lesson = {
  id: 'ts-narrowing-01',
  moduleId: 'ts-types-narrowing',
  title: 'Tipos, uniões e narrowing',
  summary:
    'Descrever com tipos os estados possíveis dos dados, deixar o compilador apontar os casos esquecidos e validar em runtime o que vem de fora.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['ts-unions', 'ts-narrowing', 'ts-runtime-validation'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Boa parte dos erros em produção é "Cannot read properties of undefined": o código assumiu que um dado estava lá e ele não estava. Uma tela de produtos, por exemplo, está carregando, carregou ou falhou, mas o código acessa a lista como se ela sempre existisse.',
        },
        {
          type: 'paragraph',
          text: 'O TypeScript consegue impedir esse tipo de erro antes de rodar, desde que os tipos descrevam a realidade. E há um limite importante: os tipos somem quando o código vira JavaScript. O que chega de fora (uma API, o localStorage) precisa ser verificado em runtime.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Modelar estados com uniões e tipos literais.',
            'Estreitar tipos (narrowing) com typeof, in, comparações e um campo discriminante.',
            'Fazer o compilador avisar quando um caso novo for esquecido (never).',
            'Diferenciar any de unknown, e as de uma verificação de verdade.',
            'Escrever type guards para validar dados externos.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Um formulário com campos condicionais',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense num formulário de entrega: se a pessoa marca "retirar na loja", não existe campo de endereço; se marca "entregar", o endereço é obrigatório. Ninguém lê o endereço antes de saber qual opção foi marcada.',
        },
        {
          type: 'paragraph',
          text: 'Uma união discriminada é esse formulário em forma de tipo. O campo status é a opção marcada; o narrowing é olhar a opção antes de ler os campos que dependem dela. O compilador faz o papel de quem revisa: só deixa ler produtos depois que você conferiu que o status é sucesso.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Uniões, narrowing e os limites dos tipos',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O TypeScript infere tipos: const total = 3 já é number. Anote os parâmetros e os tipos de retorno das funções públicas; deixe a inferência cuidar do resto.',
            'Tipos literais restringem a valores exatos: "carregando" | "sucesso" | "erro" aceita só esses três textos.',
            'Uma união (A | B) é "um ou outro". Só dá para usar o que é comum a todos os membros até você descobrir qual deles é.',
            'Narrowing é o compilador acompanhando suas verificações: depois de typeof x === "string", x é string naquele bloco. Também funcionam in, instanceof, comparações (===) e o campo discriminante de uma união.',
            'never é o tipo sem valores. Atribuir um valor a never só compila se todos os casos já foram tratados, o que transforma "esqueci um caso" em erro de compilação.',
            'any desliga a verificação: tudo compila, inclusive erros. unknown é o oposto seguro: aceita qualquer valor, mas exige narrowing antes do uso.',
            'as é uma afirmação, não uma verificação: diz ao compilador "confie em mim" e não gera nenhum código. Se o dado vier diferente, o erro aparece em runtime, longe da causa.',
            'Um type guard é uma função que verifica em runtime e informa o resultado ao compilador: valor is Produto.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Cuidado com a verificação de "verdadeiro"',
          text: 'if (!quantidade) trata 0 como "sem valor", junto com null e undefined. Quando 0 é um valor válido, compare explicitamente: if (quantidade === null).',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: estado de uma requisição',
      blocks: [
        {
          type: 'paragraph',
          text: 'Os três estados de uma busca de produtos viram uma união discriminada por status. Cada caso só tem os campos que fazem sentido nele.',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'estado-pedido.ts',
          code: REQUEST_STATE_TS,
        },
        {
          type: 'paragraph',
          text: 'Sem checar o status, o compilador não deixa acessar produtos, porque nem todo estado tem esse campo:',
        },
        { type: 'code', language: 'typescript', caption: 'Não compila', code: NO_NARROWING_TS },
        {
          type: 'paragraph',
          text: 'Os tipos protegem o que está dentro do seu código. Para o que vem de fora, verifique em runtime. O type guard abaixo recusa uma resposta em que o preço veio como texto, um erro real e comum de API.',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'validar-produto.ts',
          code: TYPE_GUARD_TS,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é verificado',
          text: 'Os testes da plataforma passam estes exemplos pelo compilador TypeScript da versão usada no projeto: o que a lição diz que compila, compila, e o que diz que falha gera o erro descrito.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Teste no seu editor',
      blocks: [
        {
          type: 'paragraph',
          text: 'Cole o primeiro exemplo num arquivo .ts no VS Code (ou no TypeScript Playground, em typescriptlang.org/play) com strict ligado:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Passe o mouse sobre estado dentro de cada case e veja o tipo mudar.',
            'Acrescente | { status: "vazio" } à união e veja onde aparece o erro.',
            'Troque const impossivel: never = estado por um default que só retorna "": o erro do caso esquecido some. Por que isso é pior?',
            'Troque o tipo do parâmetro por any e acesse estado.produtoss (com erro de digitação). O compilador avisa?',
            'Substitua o type guard por const dados = JSON.parse(...) as Produto e rode: o que acontece em dados.preco.toFixed(2)?',
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
          text: 'Primeiro, use narrowing numa união discriminada. Depois, escreva um type guard para validar dados externos. No laboratório os tipos são removidos antes de rodar, então os testes conferem o comportamento.',
        },
      ],
      exerciseIds: ['lab-ts-order-status', 'lab-ts-type-guard'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o estoque zerado que some',
      blocks: [
        {
          type: 'paragraph',
          text: 'A tela mostra "Sem informação" para um produto com estoque 0, como se o dado não tivesse chegado.',
        },
      ],
      exerciseIds: ['ts-01-truthiness'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Em Angular, o HttpClient tipa a resposta com get<Produto[]>(...), mas isso é uma afirmação como as: nada é verificado. Para dados críticos, valide na chegada.',
            'Bibliotecas como zod e valibot geram o tipo e o validador a partir de uma única definição, para não manter os dois à mão.',
            'Uniões discriminadas também modelam estados de interface (aberto/fechado/enviando) e respostas de formulários.',
            'Esta plataforma valida o progresso importado campo a campo antes de aceitá-lo, pelo mesmo motivo: o arquivo vem de fora.',
          ],
        },
      ],
    },
    {
      kind: 'assessment',
      title: 'Avaliação',
      blocks: [
        {
          type: 'paragraph',
          text: 'Para concluir a lição, acerte os três exercícios abaixo.',
        },
      ],
      exerciseIds: ['ts-01-compile', 'ts-01-as', 'ts-01-exhaustive'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Uniões discriminadas modelam estados; cada caso só tem os campos que fazem sentido nele.',
            'Narrowing: verifique antes de usar, e o compilador acompanha.',
            'const x: never = valor no default transforma caso esquecido em erro de compilação.',
            'unknown em vez de any; type guard em vez de as para dados externos.',
            'Tipos somem em runtime: o que vem de fora precisa de verificação de verdade.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Narrowing em TypeScript".',
        },
      ],
    },
  ],
};
