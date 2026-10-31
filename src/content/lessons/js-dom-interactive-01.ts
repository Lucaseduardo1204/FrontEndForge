import { Lesson } from '../../app/core/models/content.models';

/** These snippets are executed together in jsdom by `src/content/dom-examples.spec.ts`. */
export const SHOPPING_HTML = `<form id="form-item">
  <label for="novo-item">Item</label>
  <input id="novo-item" name="item" required />
  <button type="submit">Adicionar</button>
</form>

<p id="resumo" aria-live="polite"></p>
<ul id="lista"></ul>

<script src="compras.js" defer></script>`;

export const SHOPPING_STATE_JS = `// Estado: funções puras, sem DOM. Fáceis de testar.
function adicionarItem(itens, texto, id) {
  const limpo = texto.trim();
  if (limpo === '') return itens;
  return [...itens, { id, texto: limpo }];
}

function removerItem(itens, id) {
  return itens.filter((item) => item.id !== id);
}

function resumoDaLista(itens) {
  if (itens.length === 0) return 'Nenhum item';
  return itens.length === 1 ? '1 item' : \`\${itens.length} itens\`;
}`;

export const SHOPPING_DOM_JS = `// Interface: lê eventos, atualiza o estado e redesenha.
const form = document.querySelector('#form-item');
const campo = document.querySelector('#novo-item');
const lista = document.querySelector('#lista');
const resumo = document.querySelector('#resumo');

let itens = [];
let proximoId = 1;

function render() {
  lista.replaceChildren(
    ...itens.map((item) => {
      const li = document.createElement('li');
      li.textContent = item.texto; // texto do usuário: nunca innerHTML
      const remover = document.createElement('button');
      remover.type = 'button';
      remover.textContent = 'Remover';
      remover.dataset.id = String(item.id);
      remover.setAttribute('aria-label', \`Remover \${item.texto}\`);
      li.append(' ', remover);
      return li;
    }),
  );
  resumo.textContent = resumoDaLista(itens);
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // sem isso, o navegador envia o formulário e recarrega a página
  itens = adicionarItem(itens, campo.value, proximoId++);
  campo.value = '';
  campo.focus();
  render();
});

// Delegação: um único ouvinte na lista atende os botões que ainda vão existir.
lista.addEventListener('click', (event) => {
  const botao = event.target.closest('button[data-id]');
  if (!botao) return;
  itens = removerItem(itens, Number(botao.dataset.id));
  campo.focus(); // o botão focado sumiu: devolva o foco a um lugar útil
  render();
});

render();`;

export const VULNERABLE_RENDER_JS = `// VULNERÁVEL: monta HTML com o texto digitado
lista.innerHTML = itens
  .map((item) => \`<li>\${item.texto} <button data-id="\${item.id}">Remover</button></li>\`)
  .join('');`;

export const JS_DOM_INTERACTIVE_01: Lesson = {
  id: 'js-dom-interactive-01',
  moduleId: 'js-dom-interactivity',
  title: 'JavaScript: de interface estática a interativa',
  summary:
    'Reagir a eventos, guardar o estado da tela em dados e redesenhar a partir deles, com uma lista de compras que adiciona e remove itens com segurança.',
  estimatedMinutes: 45,
  difficulty: 'introductory',
  conceptIds: ['js-dom-events', 'js-state-render', 'web-xss'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'HTML e CSS montam uma página que não muda depois de carregada. JavaScript é o que permite responder ao usuário: adicionar um item, filtrar uma lista, abrir um menu. É também onde aparecem os bugs mais comuns de quem começa: o botão novo que não responde ao clique, a página que recarrega ao enviar o formulário, o contador que mostra um número diferente da lista, e o texto digitado que vira código na página.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Selecionar elementos e reagir a eventos com addEventListener.',
            'Impedir o comportamento padrão do navegador quando o JavaScript assume (preventDefault).',
            'Guardar o estado em dados e redesenhar a tela a partir deles.',
            'Atender elementos criados depois com delegação de eventos.',
            'Mostrar texto do usuário com segurança (textContent, nunca innerHTML).',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O placar e o operador',
      blocks: [
        {
          type: 'paragraph',
          text: 'Num estádio, o operador do placar não raspa a tinta de um número e pinta outro por cima. Ele atualiza a pontuação no sistema, e o placar mostra o resultado. Se alguém perguntar o placar, a resposta vem do sistema, não de olhar a tela.',
        },
        {
          type: 'paragraph',
          text: 'Com a interface é igual: os dados (o estado) são a fonte da verdade e a tela é só o reflexo deles. Um evento muda o estado, e uma função render redesenha a tela. Quando o estado fica espalhado pelo DOM (o contador lê a quantidade de <li>, o texto é lido de dentro de um <span>), as partes saem de sincronia.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Eventos, estado e DOM',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'document.querySelector(seletor) devolve o primeiro elemento que corresponde, ou null. O script precisa rodar depois de o elemento existir: defer, type="module" ou script no fim do body.',
            'elemento.addEventListener("click", funcao) registra quem trata o evento. Prefira isso a atributos como onclick no HTML: o código fica num lugar só e cada elemento pode ter vários ouvintes.',
            'A função recebe o objeto do evento. event.target é o elemento onde o evento começou (pode ser um ícone dentro do botão); event.currentTarget é o elemento onde o ouvinte foi registrado.',
            'event.preventDefault() cancela o comportamento padrão: no submit, o envio do formulário e o recarregamento da página.',
            'Eventos como click "sobem" (bubbling) do elemento clicado até o document. Por isso um único ouvinte na lista consegue tratar cliques em qualquer botão dentro dela, inclusive os criados depois. Isso é delegação; target.closest(seletor) encontra o botão a partir de onde o clique começou.',
            'createElement, textContent, append e replaceChildren constroem a interface sem interpretar texto como HTML. dataset lê e grava atributos data-*.',
            'aria-live="polite" faz o leitor de tela anunciar mudanças de texto naquele elemento, como o resumo da lista.',
          ],
        },
        {
          type: 'callout',
          tone: 'security',
          title: 'innerHTML com texto do usuário é uma brecha de segurança',
          text: 'innerHTML interpreta o texto como HTML. Se alguém digitar <img src=x onerror="...">, o navegador cria a imagem e executa o código do onerror: é um ataque de XSS. Para mostrar texto, use textContent, que trata tudo como texto. Na etapa de depuração você vê o exemplo vulnerável e a correção.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: lista de compras',
      blocks: [
        {
          type: 'paragraph',
          text: 'O HTML já é semântico e funciona como formulário: Enter no campo envia, o rótulo está ligado ao campo e o resumo é anunciado ao mudar.',
        },
        {
          type: 'code',
          language: 'html',
          caption: 'index.html (dentro do body)',
          code: SHOPPING_HTML,
        },
        {
          type: 'paragraph',
          text: 'O estado fica em funções puras: recebem dados e devolvem dados novos, sem tocar no DOM e sem alterar o array recebido.',
        },
        {
          type: 'code',
          language: 'javascript',
          caption: 'compras.js (parte 1)',
          code: SHOPPING_STATE_JS,
        },
        {
          type: 'paragraph',
          text: 'A parte de interface só conecta eventos ao estado e redesenha. render sempre reconstrói a lista e o resumo a partir de itens, então os dois nunca discordam.',
        },
        {
          type: 'code',
          language: 'javascript',
          caption: 'compras.js (parte 2)',
          code: SHOPPING_DOM_JS,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'Os testes da plataforma executam este HTML e este JavaScript num DOM simulado: adicionam itens pelo formulário, removem pelo botão e conferem que um texto com HTML aparece como texto.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'paragraph',
          text: 'Crie uma pasta com index.html (o HTML acima dentro de um documento completo) e compras.js (as duas partes, nessa ordem). Como o script usa defer e não é um módulo, basta abrir o index.html no navegador, sem servidor.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Adicione três itens só com o teclado: digite e aperte Enter.',
            'No console, registre event.target dentro do ouvinte da lista e clique em "Remover". Depois coloque um <span> dentro do botão e clique nele: o que aparece como target?',
            'Comente a linha do preventDefault, adicione um item e observe a barra de endereço e a lista.',
            'Adicione o item <b>oi</b>. Ele aparece em negrito? Troque temporariamente li.textContent por li.innerHTML e repita. Use só tags inofensivas como essa.',
            'Troque a delegação por um ouvinte em cada botão, registrado uma vez no início do script. Os itens adicionados depois respondem?',
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
          text: 'No laboratório, implemente as funções de estado da lista. Elas rodam de verdade num ambiente isolado; o laboratório ainda não executa scripts com DOM, então a parte de interface é praticada no seu computador. Depois, responda sobre o alvo do clique.',
        },
      ],
      exerciseIds: ['lab-js-shopping-list', 'dom-01-target'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a lista que executa o que você digita',
      blocks: [
        {
          type: 'paragraph',
          text: 'Uma versão "mais curta" de render monta a lista como texto HTML. Ela funciona com itens comuns, e por isso o problema passa despercebido.',
        },
        {
          type: 'code',
          language: 'javascript',
          caption: 'Vulnerável: não use',
          code: VULNERABLE_RENDER_JS,
        },
      ],
      exerciseIds: ['dom-01-xss'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Frameworks como o Angular fazem a parte de render por você: o estado vive em signals, o template se atualiza sozinho, (submit) e (click) registram os ouvintes, e a interpolação {{ }} escapa o texto como textContent.',
            'Entender o DOM continua necessário para depurar, medir desempenho e integrar bibliotecas que não são do framework.',
            'Separar estado de interface é o que permite testar a lógica sem navegador, como o laboratório faz com as funções da lista.',
            'Delegação de eventos é útil em listas longas: um ouvinte em vez de centenas.',
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
      exerciseIds: ['dom-01-flow-order', 'dom-01-prevent-default', 'dom-01-delegation'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Evento → atualiza o estado → render redesenha a partir do estado.',
            'preventDefault no submit quando o JavaScript trata o formulário.',
            'event.target é onde o clique começou; closest sobe até o elemento que interessa.',
            'Delegação: um ouvinte no contêiner atende os filhos atuais e futuros.',
            'Texto do usuário vai em textContent. innerHTML com esse texto abre espaço para XSS.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "textContent ou innerHTML?", "XSS (Cross-Site Scripting)" e "DOM". Para aplicar tudo, faça o projeto introdutório de JavaScript.',
        },
      ],
    },
  ],
};
