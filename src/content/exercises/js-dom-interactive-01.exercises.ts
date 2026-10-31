import { Exercise } from '../../app/core/models/content.models';

/** DOM claims made here are executed in `src/content/dom-examples.spec.ts`. */
export const TARGET_HTML = `<ul id="lista">
  <li>
    Leite
    <button type="button" data-id="3"><span class="icone">×</span> Remover</button>
  </li>
</ul>`;

export const EAGER_LISTENERS_JS = `// No início do script, com a lista ainda vazia:
document.querySelectorAll('#lista button').forEach((botao) => {
  botao.addEventListener('click', () => remover(botao.dataset.id));
});`;

export const JS_DOM_INTERACTIVE_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-shopping-list',
    kind: 'code',
    language: 'javascript',
    title: 'Estado da lista de compras',
    difficulty: 'introductory',
    conceptIds: ['js-state-render', 'js-mutability'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Implemente as três funções de estado da lista de compras da lição. Elas não tocam no DOM: recebem dados e devolvem dados. Cada item é um objeto { id, texto }.',
      },
    ],
    requirements: [
      'adicionarItem(itens, texto, id) devolve um novo array com { id, texto } no fim, com o texto sem espaços nas pontas.',
      'Se o texto estiver vazio (ou só tiver espaços), adicionarItem devolve a lista sem mudanças.',
      'removerItem(itens, id) devolve um novo array sem o item daquele id.',
      'resumoDaLista(itens) devolve "Nenhum item", "1 item" ou "N itens".',
      'Nenhuma função altera o array recebido.',
    ],
    examples: [
      { input: "adicionarItem([], '  Leite ', 1)", output: "[{ id: 1, texto: 'Leite' }]" },
      { input: "removerItem([{ id: 1, texto: 'Leite' }], 1)", output: '[]' },
      { input: "resumoDaLista([{ id: 1, texto: 'Leite' }])", output: "'1 item'" },
    ],
    starterCode: `function adicionarItem(itens, texto, id) {
  // Seu código aqui
}

function removerItem(itens, id) {
  // Seu código aqui
}

function resumoDaLista(itens) {
  // Seu código aqui
}

const lista = adicionarItem([], 'Leite', 1);
console.log(lista, resumoDaLista(lista));
`,
    tests: [
      {
        id: 'add',
        description: 'Adiciona o item no fim da lista',
        source:
          "expect(adicionarItem([{ id: 1, texto: 'Pão' }], 'Leite', 2)).toEqual([{ id: 1, texto: 'Pão' }, { id: 2, texto: 'Leite' }]);",
      },
      {
        id: 'trim',
        description: 'Remove os espaços das pontas do texto',
        source: "expect(adicionarItem([], '  Café  ', 1)).toEqual([{ id: 1, texto: 'Café' }]);",
      },
      {
        id: 'blank',
        description: 'Ignora texto vazio ou só com espaços',
        source:
          "const l = [{ id: 1, texto: 'Pão' }]; expect(adicionarItem(l, '   ', 2)).toEqual([{ id: 1, texto: 'Pão' }]); expect(adicionarItem([], '', 1)).toEqual([]);",
      },
      {
        id: 'remove',
        description: 'Remove só o item com o id informado',
        source:
          "expect(removerItem([{ id: 1, texto: 'A' }, { id: 2, texto: 'B' }, { id: 3, texto: 'C' }], 2)).toEqual([{ id: 1, texto: 'A' }, { id: 3, texto: 'C' }]);",
      },
      {
        id: 'immutable',
        description: 'Não altera o array recebido',
        source:
          "const l = [{ id: 1, texto: 'A' }]; adicionarItem(l, 'B', 2); removerItem(l, 1); expect(l).toEqual([{ id: 1, texto: 'A' }]);",
      },
      {
        id: 'summary',
        description: 'Resume a lista: "Nenhum item", "1 item", "3 itens"',
        source:
          "expect(resumoDaLista([])).toBe('Nenhum item'); expect(resumoDaLista([{ id: 1, texto: 'A' }])).toBe('1 item'); expect(resumoDaLista([{ id: 1, texto: 'A' }, { id: 2, texto: 'B' }, { id: 3, texto: 'C' }])).toBe('3 itens');",
      },
    ],
    hints: [
      'Para adicionar sem alterar o original, crie um array novo: [...itens, novoItem].',
      'filter devolve um array novo só com os itens que passam no teste.',
      'texto.trim() remove os espaços das pontas; compare o resultado com uma string vazia.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function adicionarItem(itens, texto, id) {
  const limpo = texto.trim();
  if (limpo === '') return itens; // nada a adicionar
  return [...itens, { id, texto: limpo }]; // array novo; o original fica intacto
}

function removerItem(itens, id) {
  return itens.filter((item) => item.id !== id);
}

function resumoDaLista(itens) {
  if (itens.length === 0) return 'Nenhum item';
  return itens.length === 1 ? '1 item' : \`\${itens.length} itens\`;
}`,
      },
      {
        type: 'paragraph',
        text: 'Por não depender do DOM nem alterar o que recebem, essas funções são testadas sem navegador, e o render sempre parte de um estado coerente.',
      },
    ],
  },
  {
    id: 'dom-01-target',
    kind: 'multiple-choice',
    title: 'Quem é o event.target?',
    difficulty: 'introductory',
    conceptIds: ['js-dom-events'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O ouvinte de clique está na <ul id="lista">, e a pessoa clica exatamente no "×". Como o código deve descobrir o id do item?',
      },
      { type: 'code', language: 'html', code: TARGET_HTML },
    ],
    options: [
      {
        id: 'closest',
        text: "event.target é o <span>; usar event.target.closest('button[data-id]').dataset.id.",
        explanation:
          'Correto. target é o elemento mais interno onde o clique começou. closest sobe a partir dele até encontrar o botão, não importa em qual parte do botão a pessoa clicou.',
      },
      {
        id: 'target-dataset',
        text: 'event.target.dataset.id, porque o target é sempre o botão.',
        explanation:
          'Incorreto. O target é o <span>, que não tem data-id: o resultado é undefined. Funciona só quando o clique cai fora do ícone, o que torna o bug intermitente.',
      },
      {
        id: 'target-ul',
        text: 'event.target é a <ul>, porque é onde o ouvinte foi registrado.',
        explanation:
          'Incorreto. O elemento do ouvinte é event.currentTarget. O target é onde o clique começou.',
      },
      {
        id: 'listener-each',
        text: 'Não dá para descobrir com um ouvinte na <ul>: é preciso um ouvinte em cada botão.',
        explanation:
          'Incorreto. O clique sobe do <span> até a <ul> (bubbling), e target.closest encontra o botão. Isso é delegação de eventos.',
      },
    ],
    correctOptionIds: ['closest'],
    hints: [
      'O target é o elemento onde o clique começou ou onde o ouvinte está?',
      'Que método procura um ancestral que corresponde a um seletor?',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `lista.addEventListener('click', (event) => {
  const botao = event.target.closest('button[data-id]');
  if (!botao) return; // clique fora de um botão
  remover(Number(botao.dataset.id));
});`,
      },
    ],
  },
  {
    id: 'dom-01-xss',
    kind: 'multiple-choice',
    title: 'O item que vira código',
    difficulty: 'introductory',
    conceptIds: ['web-xss'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Com o render vulnerável (innerHTML), alguém adiciona o item <img src=x onerror="alert(1)">. O que acontece e qual é a correção?',
      },
    ],
    options: [
      {
        id: 'executes',
        text: 'O navegador cria uma imagem, ela falha ao carregar e o onerror executa o código. Corrigir montando os elementos com createElement e textContent.',
        explanation:
          'Correto. innerHTML interpreta o texto como HTML, então o item vira um elemento com um manipulador de eventos. Com textContent, o mesmo texto aparece literalmente e nada executa. Isso é XSS: aqui o alert é inofensivo, mas o código poderia ler dados da página ou agir em nome da pessoa.',
      },
      {
        id: 'escaped',
        text: 'Aparece como texto, porque innerHTML escapa os caracteres especiais.',
        explanation:
          'Incorreto. Quem escapa é textContent (e a interpolação de frameworks). innerHTML faz o contrário: interpreta a string como HTML.',
      },
      {
        id: 'self-only',
        text: 'Não é problema: só afeta quem digitou o próprio texto.',
        explanation:
          'Incorreto. Listas são salvas, compartilhadas e sincronizadas. O mesmo render vai mostrar texto digitado por outras pessoas, e o código executa no navegador de quem abrir a lista.',
      },
      {
        id: 'replace',
        text: 'Basta remover < e > do texto antes de usar innerHTML.',
        explanation:
          'Incorreto. Filtrar caracteres à mão é frágil: o mesmo texto também entra em atributos (data-id="..."), onde aspas bastam para escapar. A forma segura é não interpretar texto como HTML: textContent.',
      },
    ],
    correctOptionIds: ['executes'],
    hints: [
      'innerHTML trata a string como texto ou como HTML?',
      'Qual propriedade a versão segura do render usa para o texto do item?',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const li = document.createElement('li');
li.textContent = item.texto; // aparece literalmente: <img src=x onerror="alert(1)">`,
      },
    ],
  },
  {
    id: 'dom-01-flow-order',
    kind: 'order-steps',
    title: 'Do Enter à lista atualizada',
    difficulty: 'introductory',
    conceptIds: ['js-dom-events', 'js-state-render'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ordene o que acontece no exemplo da lição quando a pessoa adiciona um item.',
      },
    ],
    items: [
      {
        id: 'enter',
        text: 'A pessoa digita o item e aperta Enter no campo',
        why: 'Tudo começa com a ação de quem usa a página.',
      },
      {
        id: 'submit',
        text: 'O navegador dispara o evento submit no formulário',
        why: 'Enter num campo de formulário com botão de envio dispara o submit; é por isso que o exemplo usa <form>.',
      },
      {
        id: 'prevent',
        text: 'O ouvinte chama event.preventDefault() e o envio é cancelado',
        why: 'É a primeira coisa no ouvinte: sem isso a página recarregaria e o estado se perderia.',
      },
      {
        id: 'state',
        text: 'adicionarItem devolve um novo array, que passa a ser o estado',
        why: 'O estado muda antes da tela: render só desenha o que já está nos dados.',
      },
      {
        id: 'render',
        text: 'render reconstrói a lista e o resumo a partir do estado',
        why: 'A tela é derivada do estado, então vem depois dele.',
      },
      {
        id: 'announce',
        text: 'O leitor de tela anuncia o novo resumo',
        why: 'O anúncio acontece porque o texto do elemento com aria-live mudou, ou seja, depois do render.',
      },
    ],
    explanation:
      'Evento → preventDefault → novo estado → render → a tela (e o leitor de tela) refletem o estado. A ordem é sempre essa, em qualquer interface.',
    hints: ['Comece pelo que a pessoa faz.', 'O que vem antes: mudar os dados ou desenhar a tela?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Enter no campo.',
          'Evento submit.',
          'preventDefault.',
          'adicionarItem: novo estado.',
          'render.',
          'Anúncio do aria-live.',
        ],
      },
    ],
  },
  {
    id: 'dom-01-prevent-default',
    kind: 'multiple-choice',
    title: 'Sem preventDefault',
    difficulty: 'introductory',
    conceptIds: ['js-dom-events'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Se a linha event.preventDefault() for removida do ouvinte de submit, o que acontece ao adicionar "Leite"?',
      },
    ],
    options: [
      {
        id: 'reload',
        text: 'O ouvinte roda, mas em seguida o navegador envia o formulário: a página recarrega com ?item= no endereço e a lista volta a ficar vazia.',
        explanation:
          'Correto. Um <form> sem action envia para a própria página, por GET, com os campos na URL. O envio acontece depois do ouvinte, que já limpou o campo: por isso o endereço termina em ?item= sem o texto. O recarregamento descarta tudo o que estava na memória, inclusive o array itens.',
      },
      {
        id: 'nothing',
        text: 'Nada muda: preventDefault só serve para links.',
        explanation:
          'Incorreto. preventDefault cancela o comportamento padrão de qualquer evento que o tenha: seguir um link, enviar um formulário, marcar uma caixa.',
      },
      {
        id: 'twice',
        text: 'O item é adicionado duas vezes, uma pelo JavaScript e outra pelo navegador.',
        explanation:
          'Incorreto. O navegador não sabe nada da lista: o envio padrão só navega para outro endereço, e o recarregamento apaga o que o JavaScript tinha feito.',
      },
      {
        id: 'error',
        text: 'O console mostra um erro e nada acontece.',
        explanation:
          'Incorreto. Não há erro: o envio do formulário é um comportamento normal do navegador, que o código deixou de cancelar.',
      },
    ],
    correctOptionIds: ['reload'],
    hints: [
      'O que um formulário faz quando é enviado, sem nenhum JavaScript?',
      'O que acontece com as variáveis do script quando a página recarrega?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'A página recarrega e o estado em memória se perde. preventDefault diz ao navegador que o JavaScript assumiu o envio.',
      },
    ],
  },
  {
    id: 'dom-01-delegation',
    kind: 'multiple-choice',
    title: 'Os botões que não respondem',
    difficulty: 'introductory',
    conceptIds: ['js-dom-events'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Em vez da delegação, alguém registrou os ouvintes assim. Depois de adicionar dois itens, o que acontece ao clicar em "Remover"?',
      },
      { type: 'code', language: 'javascript', code: EAGER_LISTENERS_JS },
    ],
    options: [
      {
        id: 'nothing-happens',
        text: 'Nada: os botões foram criados depois que os ouvintes foram registrados, então não têm ouvinte.',
        explanation:
          'Correto. querySelectorAll devolve só os elementos que existem naquele momento (uma lista estática), e a lista estava vazia. Os botões criados pelo render nunca recebem ouvinte. Um ouvinte na <ul> resolve, porque o clique sobe até ela.',
      },
      {
        id: 'works',
        text: 'Funciona normalmente: querySelectorAll acompanha os elementos novos.',
        explanation:
          'Incorreto. A NodeList de querySelectorAll é estática: é uma foto do momento da chamada. Elementos criados depois não entram nela.',
      },
      {
        id: 'first-only',
        text: 'Só o primeiro item pode ser removido.',
        explanation:
          'Incorreto. Nenhum botão existia quando o código rodou, então nenhum recebe ouvinte.',
      },
      {
        id: 'error',
        text: 'O script quebra com erro, porque querySelectorAll devolve null quando não encontra nada.',
        explanation:
          'Incorreto. querySelectorAll devolve uma lista vazia (e forEach simplesmente não executa). Quem devolve null é querySelector.',
      },
    ],
    correctOptionIds: ['nothing-happens'],
    hints: [
      'Quantos botões existiam quando esse código rodou?',
      'Um elemento criado depois ganha os ouvintes registrados antes?',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `lista.addEventListener('click', (event) => {
  const botao = event.target.closest('button[data-id]');
  if (botao) remover(botao.dataset.id);
});`,
      },
    ],
  },
];
