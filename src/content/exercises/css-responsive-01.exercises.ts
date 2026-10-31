import { Exercise } from '../../app/core/models/content.models';

const IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%2360a5fa'/></svg>";

const CARD = `<article class="produto">
    <img src="${IMG}" alt="">
    <div class="info">
      <h2>Café torrado 500g</h2>
      <p>Torra média, notas de chocolate.</p>
    </div>
  </article>`;

/** Layout-dependent: verified in a real browser, not in jsdom (see lab-solutions.spec.ts). */
export const CONTAINER_LAB_SOLUTION = `<style>
  .slot { container-type: inline-size; margin-bottom: 16px; }
  .produto { border: 1px solid #ccc; padding: 12px; }
  .produto img { width: 100%; display: block; }
  .produto h2 { font-size: clamp(1.125rem, 1rem + 2.5cqi, 1.75rem); margin: 8px 0; }

  @container (min-width: 480px) {
    .produto { display: flex; gap: 16px; align-items: flex-start; }
    .produto img { width: 40%; flex-shrink: 0; }
  }
</style>

<div class="slot" id="estreito" style="width: 300px">
  ${CARD}
</div>
<div class="slot" id="largo" style="width: 640px">
  ${CARD}
</div>
`;

export const CSS_RESPONSIVE_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-css-container',
    kind: 'code',
    language: 'html',
    title: 'Um cartão que mede o próprio espaço',
    difficulty: 'intermediate',
    conceptIds: ['css-container-queries', 'css-fluid-units'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O mesmo cartão aparece numa área de 300px e noutra de 640px. Faça o layout mudar conforme o espaço da área (não o da tela) e o título crescer com ela, dentro de limites. Altere só o <style>.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Como os testes medem',
        text: 'Os testes leem posições e tamanhos reais na prévia, e mudam a largura das áreas para conferir que o cartão reage ao contêiner. Por isso não vale usar @media.',
      },
    ],
    requirements: [
      'Em áreas com 480px ou mais: imagem à esquerda do texto, com no máximo 40% da largura do cartão.',
      'Em áreas menores: imagem em cima do texto.',
      'O título tem entre 18px e 28px e é maior na área larga que na estreita.',
      'Numa área muito larga (1200px), o título para em 28px.',
      'Sem @media: o cartão reage ao contêiner.',
    ],
    examples: [],
    starterCode: `<style>
  .slot { margin-bottom: 16px; }
  .produto { border: 1px solid #ccc; padding: 12px; }
  .produto img { width: 100%; display: block; }
  .produto h2 { font-size: 20px; margin: 8px 0; }
</style>

<div class="slot" id="estreito" style="width: 300px">
  ${CARD}
</div>
<div class="slot" id="largo" style="width: 640px">
  ${CARD}
</div>
`,
    tests: [
      {
        id: 'wide-row',
        description: 'Na área de 640px, a imagem fica à esquerda do texto',
        source:
          "const c = document.querySelector('#largo'); const img = c.querySelector('img').getBoundingClientRect(); const h = c.querySelector('h2').getBoundingClientRect(); expect(img.right <= h.left + 1).toBe(true); expect(img.top < h.bottom && h.top < img.bottom).toBe(true);",
      },
      {
        id: 'narrow-column',
        description: 'Na área de 300px, a imagem fica em cima do texto',
        source:
          "const c = document.querySelector('#estreito'); expect(c.querySelector('img').getBoundingClientRect().bottom <= c.querySelector('h2').getBoundingClientRect().top + 1).toBe(true);",
      },
      {
        id: 'image-width',
        description: 'Na área larga, a imagem ocupa no máximo 40% do cartão',
        source:
          "const c = document.querySelector('#largo'); expect(c.querySelector('img').getBoundingClientRect().width <= c.querySelector('.produto').getBoundingClientRect().width * 0.4 + 1).toBe(true);",
      },
      {
        id: 'fluid-title',
        description: 'O título fica entre 18px e 28px e é maior na área larga',
        source:
          "const fs = (id) => parseFloat(getComputedStyle(document.querySelector(id + ' h2')).fontSize); const a = fs('#estreito'); const b = fs('#largo'); expect(a >= 17.5 && a <= 28.5).toBe(true); expect(b >= 17.5 && b <= 28.5).toBe(true); expect(b > a).toBe(true);",
      },
      {
        id: 'title-cap',
        description: 'Numa área de 1200px, o título para em 28px',
        source:
          "const c = document.querySelector('#largo'); const antes = c.style.width; c.style.width = '1200px'; const fs = parseFloat(getComputedStyle(c.querySelector('h2')).fontSize); c.style.width = antes; expect(Math.abs(fs - 28) <= 0.5).toBe(true);",
      },
      {
        id: 'container-not-viewport',
        description: 'A área estreita, alargada para 640px, também vira linha (sem @media)',
        source:
          "const css = Array.from(document.querySelectorAll('style')).map((s) => s.textContent).join(''); expect(css.includes('@media')).toBe(false); const c = document.querySelector('#estreito'); const antes = c.style.width; c.style.width = '640px'; const img = c.querySelector('img').getBoundingClientRect(); const h = c.querySelector('h2').getBoundingClientRect(); c.style.width = antes; expect(img.right <= h.left + 1).toBe(true);",
      },
    ],
    hints: [
      'O contêiner é o .slot: ele precisa de container-type: inline-size.',
      'Dentro de @container (min-width: 480px), o .produto vira flex e a imagem ganha width: 40%.',
      'Para o título: clamp com limites em rem e um valor preferido em cqi, como 1rem + 2.5cqi.',
    ],
    solution: [
      { type: 'code', language: 'html', code: CONTAINER_LAB_SOLUTION },
      {
        type: 'paragraph',
        text: 'container-type transforma cada .slot num contêiner consultável, e a regra @container vale para cada cartão conforme a largura do seu .slot. No título, 1rem + 2.5cqi cresce com o contêiner (cqi é 1% da largura dele), e o clamp segura entre 18px (1.125rem) e 28px (1.75rem). Outras combinações também passam: os testes medem o resultado.',
      },
    ],
  },
  {
    id: 'responsive-01-units',
    kind: 'multiple-choice',
    title: 'px ou rem para o texto?',
    difficulty: 'intermediate',
    conceptIds: ['css-fluid-units'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma pessoa com baixa visão configurou o navegador com fonte padrão de 24px. O que acontece com font-size: 16px e com font-size: 1rem?',
      },
    ],
    options: [
      {
        id: 'rem-scales',
        text: '16px continua 16px; 1rem passa a valer 24px, respeitando a preferência.',
        explanation:
          'Correto. Medido no Chromium com a fonte padrão em 24px: 10rem virou 240px e 160px continuou 160px. O zoom da página aumenta os dois, mas a preferência de fonte só afeta unidades relativas.',
      },
      {
        id: 'both-scale',
        text: 'Os dois passam a 24px: o navegador ajusta tudo.',
        explanation: 'Incorreto. A preferência de tamanho de fonte não altera valores em px.',
      },
      {
        id: 'none',
        text: 'Nenhum muda: só o zoom altera o tamanho do texto.',
        explanation: 'Incorreto. A preferência de fonte muda o valor de 1rem.',
      },
      {
        id: 'px-better',
        text: 'px é melhor, porque garante o layout como foi desenhado.',
        explanation:
          'Garante o layout ignorando quem precisa de letras maiores. Layouts em rem acompanham a fonte.',
      },
    ],
    correctOptionIds: ['rem-scales'],
    hints: ['A que valor o rem é relativo?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Texto e espaçamentos em rem; px para detalhes como bordas finas.',
      },
    ],
  },
  {
    id: 'responsive-01-container-type',
    kind: 'multiple-choice',
    title: 'A container query que não funciona',
    difficulty: 'intermediate',
    conceptIds: ['css-container-queries'],
    prompt: [
      { type: 'paragraph', text: 'Na etapa de depuração, por que o cartão nunca vira flex?' },
    ],
    options: [
      {
        id: 'no-container',
        text: 'Nenhum ancestral declara container-type, então a @container não tem contêiner para consultar.',
        explanation:
          'Correto. Medido no Chromium: num pai de 640px sem container-type, o cartão continuou em bloco; com container-type: inline-size, virou flex. A correção é declarar container-type no elemento que define o espaço do cartão.',
      },
      {
        id: 'support',
        text: 'Container queries ainda não funcionam nos navegadores atuais.',
        explanation: 'Incorreto. Têm suporte nos navegadores atuais.',
      },
      {
        id: 'specificity',
        text: 'A regra de fora tem especificidade maior e vence.',
        explanation:
          'Incorreto. As duas regras têm o mesmo seletor; a de dentro da @container vem depois e venceria se se aplicasse.',
      },
      {
        id: 'media',
        text: 'Falta trocar @container por @media.',
        explanation: 'Mudaria a pergunta para o tamanho da tela, que não é o que o cartão precisa.',
      },
    ],
    correctOptionIds: ['no-container'],
    hints: ['Qual elemento é o contêiner consultado?'],
    solution: [
      {
        type: 'code',
        language: 'css',
        code: `.area-do-cartao {\n  container-type: inline-size;\n}`,
      },
    ],
  },
  {
    id: 'responsive-01-clamp',
    kind: 'multiple-choice',
    title: 'O valor do clamp',
    difficulty: 'intermediate',
    conceptIds: ['css-fluid-units'],
    prompt: [
      {
        type: 'paragraph',
        text: 'h1 { font-size: clamp(1rem, 4vw, 2rem); }, com a fonte padrão do navegador (16px). Qual é o tamanho numa tela de 1400px?',
      },
    ],
    options: [
      {
        id: '32',
        text: '32px: 4vw seria 56px, mas o máximo é 2rem.',
        explanation: 'Correto. Medido no Chromium: 16px em 320px, 24px em 600px e 32px em 1400px.',
      },
      {
        id: '56',
        text: '56px: 4% de 1400.',
        explanation: 'Incorreto. É o valor preferido, mas o clamp limita ao máximo.',
      },
      {
        id: '16',
        text: '16px: o clamp usa o mínimo.',
        explanation: 'Incorreto. O mínimo só vale quando o preferido fica abaixo dele.',
      },
      {
        id: '24',
        text: '24px: a média entre mínimo e máximo.',
        explanation: 'Incorreto. clamp não faz média; 24px é o resultado numa tela de 600px.',
      },
    ],
    correctOptionIds: ['32'],
    hints: ['Calcule 4vw e compare com os limites.'],
    solution: [
      { type: 'paragraph', text: 'clamp(min, preferido, max) = max(min, min(preferido, max)).' },
    ],
  },
  {
    id: 'responsive-01-media-or-container',
    kind: 'multiple-choice',
    title: '@media ou @container?',
    difficulty: 'intermediate',
    conceptIds: ['css-container-queries'],
    prompt: [{ type: 'paragraph', text: 'Qual combinação está correta?' }],
    options: [
      {
        id: 'right',
        text: 'Esconder o menu lateral em telas pequenas: @media. Cartão de produto que aparece em colunas de larguras diferentes: @container. Menos animação: @media (prefers-reduced-motion).',
        explanation:
          'Correto. O layout da página depende da tela; o componente depende do espaço que recebe; preferências do sistema são consultadas por media queries.',
      },
      {
        id: 'all-container',
        text: 'Tudo com @container, que substitui @media.',
        explanation:
          'Incorreto. Preferências do sistema e o layout da página continuam sendo media queries.',
      },
      {
        id: 'all-media',
        text: 'Tudo com @media, ajustando um breakpoint por lugar onde o cartão aparece.',
        explanation:
          'Funciona até o cartão aparecer num lugar novo; o componente fica acoplado às páginas.',
      },
      {
        id: 'motion-container',
        text: 'Menos animação com @container (prefers-reduced-motion).',
        explanation: 'Incorreto. Preferências do usuário são media features.',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['O que cada pergunta precisa saber: a tela, o espaço do componente ou a pessoa?'],
    solution: [
      { type: 'paragraph', text: 'Página e preferências: @media. Componentes: @container.' },
    ],
  },
  {
    id: 'responsive-01-motion',
    kind: 'multiple-choice',
    title: 'Respeitando o movimento reduzido',
    difficulty: 'intermediate',
    conceptIds: ['css-user-preferences'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um painel desliza com transition: transform 300ms. Qual é a forma correta de atender quem configurou o sistema para reduzir movimento?',
      },
    ],
    options: [
      {
        id: 'media',
        text: '@media (prefers-reduced-motion: reduce) { .painel { transition-duration: 0.01ms; } }: o painel aparece no lugar sem deslizar.',
        explanation:
          'Correto. Medido no Chromium com a preferência emulada: a transição caiu de 0,3s para 0,01ms.',
      },
      {
        id: 'remove',
        text: 'Remover todas as animações do site para todo mundo.',
        explanation:
          'Atende quem pediu, mas tira de quem se beneficia de transições que explicam a mudança.',
      },
      {
        id: 'js-setting',
        text: 'Criar uma opção só na página de configurações da aplicação.',
        explanation:
          'Pode complementar, mas quem já configurou o sistema não deveria precisar configurar de novo.',
      },
      {
        id: 'slower',
        text: 'Deixar a animação mais lenta para ficar mais suave.',
        explanation: 'Incorreto. Mais lenta continua sendo movimento, e por mais tempo.',
      },
    ],
    correctOptionIds: ['media'],
    hints: ['Existe uma media feature para essa preferência.'],
    solution: [
      {
        type: 'code',
        language: 'css',
        code: `@media (prefers-reduced-motion: reduce) {
  .painel {
    transition-duration: 0.01ms;
  }
}`,
      },
    ],
  },
];
