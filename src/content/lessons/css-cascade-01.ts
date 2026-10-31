import { Lesson } from '../../app/core/models/content.models';

/** Computed in a real browser and in `src/content/css-examples.spec.ts` (jsdom). */
export const MENU_HTML = `<nav id="menu" class="menu">
  <a class="link" href="/">Início</a>
  <a class="link link--ativo" href="/receitas" aria-current="page">Receitas</a>
</nav>`;

export const MENU_CSS_BUG = `#menu a {
  color: gray; /* especificidade (1, 0, 1) */
}

.link--ativo {
  color: royalblue; /* (0, 1, 0): perde, mesmo vindo depois */
}`;

export const MENU_CSS_FIX = `.link {
  color: gray; /* (0, 1, 0) */
}

.link--ativo {
  color: royalblue; /* (0, 1, 0): empate, vence a que vem depois */
}`;

export const INHERITANCE_CSS = `.cartao {
  color: #1d4ed8;
  font-family: Georgia, serif;
  border: 2px solid #1d4ed8;
  padding: 1rem;
}`;

export const CSS_CASCADE_01: Lesson = {
  id: 'css-cascade-01',
  moduleId: 'css-cascade-specificity',
  title: 'Cascata, especificidade e herança',
  summary:
    'Por que uma regra de CSS "não pega": como o navegador escolhe entre declarações em conflito e quais propriedades passam de pai para filho.',
  estimatedMinutes: 40,
  difficulty: 'introductory',
  conceptIds: ['css-cascade', 'css-inheritance'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'O bug de CSS mais comum não é de sintaxe: é uma regra correta que simplesmente não aparece. A reação típica é acrescentar !important, depois outro !important para vencer o primeiro, até o estilo ficar impossível de mudar. Tudo isso some quando você sabe como o navegador decide qual declaração vence.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Prever qual declaração vence um conflito, sem tentativa e erro.',
            'Calcular e comparar especificidade.',
            'Saber quais propriedades são herdadas e controlar a herança.',
            'Depurar com o painel de estilos do DevTools.',
            'Escrever CSS de baixa especificidade, fácil de sobrescrever.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Um desempate em etapas',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense num campeonato com critérios de desempate: primeiro pontos, depois saldo de gols, depois gols marcados. Um critério só é usado quando o anterior empatou. Ninguém soma saldo com pontos.',
        },
        {
          type: 'paragraph',
          text: 'A cascata funciona assim. Quando duas declarações disputam a mesma propriedade do mesmo elemento, o navegador compara importância, depois camada, depois especificidade e, por fim, a ordem no código. Herança é outra coisa: só entra quando nenhuma declaração atinge o elemento.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Como o navegador decide',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Importância: uma declaração com !important vence as normais. Use em último caso: para vencê-la depois, só outro !important.',
            'Estilo no atributo style do elemento vence qualquer seletor de folha de estilos (a menos que a folha use !important).',
            'Camadas (@layer): entre declarações normais, a camada declarada por último vence, e estilos fora de qualquer camada vencem os que estão dentro de camadas.',
            'Especificidade: o seletor mais específico vence.',
            'Ordem: em empate em tudo acima, vence a declaração que aparece por último.',
          ],
        },
        {
          type: 'table',
          caption: 'Especificidade: três colunas comparadas da esquerda para a direita',
          headers: ['Coluna', 'O que conta', 'Exemplo'],
          rows: [
            ['A', 'Seletores de id', '#menu'],
            ['B', 'Classes, atributos e pseudo-classes', '.link, [href], :hover'],
            ['C', 'Elementos e pseudo-elementos', 'a, p, ::before'],
            ['Nenhuma', 'Seletor universal e combinadores', '*, >, +, ~, espaço'],
          ],
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Compare coluna por coluna, sem "vai um": (1, 0, 0) vence (0, 11, 0). Um id vence qualquer quantidade de classes.',
            ':where(...) tem especificidade zero, bom para estilos base fáceis de sobrescrever. :is(...), :not(...) e :has(...) valem o argumento mais específico.',
            'Herança: color, font-*, line-height, text-align e visibility passam para os filhos. margin, padding, border, background e width não passam.',
            'inherit força herdar; initial volta ao valor inicial da especificação; unset herda se a propriedade é herdável e, se não, usa o inicial; revert volta ao estilo padrão do navegador.',
            'Campos de formulário e botões não herdam a fonte da página porque o navegador define uma fonte para eles. Por isso é comum ver button, input { font: inherit; }.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Onde ver isso',
          text: 'No DevTools, em Elementos → Estilos, as declarações que perderam aparecem riscadas, ordenadas da que venceu para a que perdeu. A aba Computado mostra o valor final e de qual regra ele veio, inclusive quando foi herdado.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: o link ativo que não fica azul',
      blocks: [
        {
          type: 'paragraph',
          text: 'O menu marca a página atual com a classe link--ativo, mas o link continua cinza.',
        },
        { type: 'code', language: 'html', caption: 'menu.html', code: MENU_HTML },
        { type: 'code', language: 'css', caption: 'Antes: o id vence', code: MENU_CSS_BUG },
        {
          type: 'paragraph',
          text: '#menu a tem um id; .link--ativo, só uma classe. A especificidade é decidida antes da ordem, então vir depois não ajuda. Em vez de aumentar a especificidade da regra ativa (ou usar !important), baixe a da regra base: as duas passam a ter (0, 1, 0), e a ordem desempata.',
        },
        {
          type: 'code',
          language: 'css',
          caption: 'Depois: especificidades iguais, a ordem decide',
          code: MENU_CSS_FIX,
        },
        {
          type: 'paragraph',
          text: 'Herança em ação: color e font-family declaradas no cartão chegam ao parágrafo dentro dele; border e padding, não.',
        },
        { type: 'code', language: 'css', caption: 'herança', code: INHERITANCE_CSS },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no navegador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Monte o menu com a versão "antes" e inspecione o link ativo: veja a declaração color: royalblue riscada no painel Estilos.',
            'Passe o mouse sobre um seletor no painel Estilos: nas versões recentes do Chrome e do Edge, o DevTools mostra a especificidade dele. Confira se bate com a sua conta.',
            'Troque #menu a por :where(#menu) a e veja o link ficar azul. Por quê?',
            'Coloque um <p> dentro do .cartao e confira na aba Computado a origem de color (herdada) e de padding (valor inicial, 0).',
            'Adicione um <button> no cartão: a fonte dele muda? Acrescente button { font: inherit; } e compare.',
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
          text: 'No laboratório, conserte um botão de perigo que não fica vermelho, sem !important. Depois, compare especificidades.',
        },
      ],
      exerciseIds: ['lab-css-cascade-fix', 'css-01-specificity'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a guerra de !important',
      blocks: [
        {
          type: 'code',
          language: 'css',
          caption: 'Três pessoas, três correções',
          code: `.botao { background: blue !important; }
.formulario .botao { background: green !important; }
#salvar { background: red; } /* não pega: por quê? */`,
        },
      ],
      exerciseIds: ['css-01-important'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Convenções como BEM (bloco__elemento--modificador) mantêm quase tudo em uma única classe, com especificidade (0, 1, 0): conflitos se resolvem pela ordem e ficam previsíveis.',
            'Ids continuam úteis para âncoras, label for e aria-labelledby, mas raramente como seletor de estilo.',
            'No Angular, os estilos de um componente são encapsulados por padrão: o Angular acrescenta um atributo aos seletores, o que soma especificidade na coluna B. Saber disso explica por que um estilo global às vezes perde para o do componente.',
            'Design systems costumam usar @layer (reset, base, componentes, utilitários) para que a ordem das camadas, e não a especificidade, decida os conflitos.',
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
      exerciseIds: ['css-01-predict', 'css-01-inheritance', 'css-01-order-criteria'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Desempate: importância → camada → especificidade → ordem.',
            'Especificidade em três colunas (ids, classes, elementos), comparadas da esquerda para a direita.',
            'Para uma regra pegar, baixe a especificidade de quem atrapalha antes de subir a sua.',
            'Herança só vale quando nenhuma declaração atinge o elemento; color e fontes herdam, caixas não.',
            '!important resolve hoje e cria o próximo bug.',
          ],
        },
      ],
    },
  ],
};
