import { Project } from '../../app/core/models/content.models';

/** Guided HTML/CSS project of phase 1. No finished code: steps guide, tests verify. */
export const PROJECT_HTML_PROFILE: Project = {
  id: 'project-html-profile',
  phaseId: 'phase-01-html',
  title: 'Página de apresentação profissional acessível',
  briefing: [
    {
      type: 'paragraph',
      text: 'Você vai construir a sua página de apresentação: quem você é, o que estuda, projetos e um formulário de contato. É o tipo de página que recrutadores abrem no celular, às vezes com leitor de tela, às vezes com conexão ruim.',
    },
    {
      type: 'paragraph',
      text: 'O foco não é o visual elaborado: é uma base sólida. HTML semântico, que funcione no teclado, com textos alternativos, formulário acessível e layout que se adapta a qualquer tela, usando só HTML e CSS.',
    },
  ],
  problem:
    'Muitas páginas pessoais são um amontoado de <div> com aparência bonita, mas impossíveis de navegar por teclado, sem estrutura para leitores de tela e quebradas no celular.',
  requiredFeatures: [
    'Cabeçalho com seu nome e navegação para as seções da página.',
    'Seção "Sobre" com um parágrafo de apresentação.',
    'Seção "Projetos" com pelo menos dois projetos (título, descrição e link).',
    'Formulário de contato com nome, e-mail e mensagem.',
    'Rodapé com links para perfis (por exemplo, GitHub e LinkedIn).',
    'Layout que funciona do celular (360px) ao desktop.',
  ],
  optionalFeatures: [
    'Tema escuro com prefers-color-scheme.',
    'Foto com texto alternativo descritivo.',
    'Seção de habilidades em lista.',
  ],
  suggestedArchitecture: [
    {
      type: 'list',
      ordered: false,
      items: [
        'Um único arquivo index.html com um <style> no <head> (para a verificação automática, o CSS precisa estar no próprio HTML).',
        'Estrutura: <header> (com <nav>), <main> (com <section> para cada parte) e <footer>.',
        'CSS escrito primeiro para telas pequenas (mobile first), com @media para telas maiores.',
        'Cores, espaçamentos e fontes em custom properties no :root.',
      ],
    },
  ],
  constraints: [
    'Somente HTML e CSS: nada de JavaScript nesta etapa.',
    'Sem frameworks de CSS: o objetivo é entender o que eles fazem por você.',
    'Sem atributos de evento inline (onclick, onload…).',
  ],
  accessibilityRequirements: [
    'Idioma da página declarado em <html lang>.',
    'Um único <h1> e títulos sem pular níveis.',
    'Todo campo do formulário com <label> associado.',
    'Toda imagem com alt (vazio, alt="", só para imagens decorativas).',
    'Foco visível em links e botões; nada que dependa só de cor.',
    'Contraste mínimo WCAG AA (4,5:1 para texto normal).',
  ],
  securityRequirements: [
    'Links com target="_blank" precisam de rel="noopener noreferrer": sem isso, a página aberta recebe acesso a window.opener e pode redirecionar a sua aba (tabnabbing).',
    'Nenhum JavaScript inline (onclick="…"): além de misturar responsabilidades, é bloqueado por políticas de segurança de conteúdo (CSP) bem configuradas.',
  ],
  testCases: [
    'Navegue a página inteira só com Tab e Shift+Tab: todo link e campo recebe foco visível, na ordem de leitura.',
    'Envie o formulário vazio: o navegador deve impedir o envio e indicar o campo obrigatório.',
    'Digite um e-mail sem @: a validação nativa deve recusar.',
    'Abra a página com 360px de largura: nada corta nem gera rolagem horizontal.',
    'Use um leitor de tela (NVDA, VoiceOver ou o do celular) e navegue pelos títulos.',
  ],
  steps: [
    {
      id: 'plan',
      title: 'Planeje o conteúdo e a estrutura',
      guidance: [
        {
          type: 'paragraph',
          text: 'Antes de abrir o editor, escreva o esqueleto da página em tópicos, como um índice: quais são as regiões, quais títulos existem e em que nível. O índice que você escrever é a mesma estrutura que um leitor de tela vai anunciar.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Pergunta-guia',
          text: 'Se alguém lesse só os seus títulos, entenderia a página? Se não, a hierarquia ainda não está pronta.',
        },
      ],
      checklist: [
        {
          id: 'plan-outline',
          text: 'Escrevi o índice da página com os níveis de título (h1, h2…).',
        },
        { id: 'plan-content', text: 'Tenho os textos reais (sem lorem ipsum) para cada seção.' },
      ],
    },
    {
      id: 'semantic-html',
      title: 'Escreva o HTML semântico',
      guidance: [
        {
          type: 'paragraph',
          text: 'Comece pelo documento completo: doctype, <html lang="pt-BR">, <head> com charset, viewport, <title> e meta description. No <body>, use <header>, <nav>, <main>, <section> e <footer> conforme o significado de cada parte.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Para cada <div> que você criar, pergunte: existe um elemento com significado para isso?',
            'Navegação é uma lista de links: <nav> com <ul> e <a>.',
            'Os projetos podem ser <article>, porque cada um faz sentido sozinho.',
          ],
        },
      ],
      checklist: [
        { id: 'html-head', text: 'O <head> tem charset, viewport, <title> e meta description.' },
        { id: 'html-landmarks', text: 'Usei header, nav, main e footer de acordo com o conteúdo.' },
        { id: 'html-headings', text: 'Há um único h1 e os títulos não pulam níveis.' },
      ],
    },
    {
      id: 'form',
      title: 'Monte o formulário de contato acessível',
      guidance: [
        {
          type: 'paragraph',
          text: 'Cada campo precisa de um <label> ligado a ele (for apontando para o id do campo, ou o campo dentro do label). Use o tipo certo de input: type="email" já valida o formato e abre o teclado certo no celular. Marque com required o que é obrigatório.',
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'O formulário ainda não envia',
          text: 'Um formulário estático não tem para onde mandar os dados: enviar exige um backend ou um serviço. Neste projeto o objetivo é a marcação e a validação nativa. O envio de verdade aparece mais adiante no curso.',
        },
      ],
      checklist: [
        {
          id: 'form-labels',
          text: 'Todos os campos têm label associado (clicar no texto foca o campo).',
        },
        { id: 'form-types', text: 'Usei type="email" e required onde faz sentido.' },
        { id: 'form-button', text: 'O envio é feito por um <button type="submit">.' },
      ],
    },
    {
      id: 'responsive-css',
      title: 'Estilize com CSS responsivo',
      guidance: [
        {
          type: 'paragraph',
          text: 'Escreva primeiro o CSS para telas pequenas, com o conteúdo em uma coluna. Depois, com @media (min-width: …), reorganize para telas maiores. Coloque cores e espaçamentos em custom properties para manter tudo consistente.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Teste com o modo responsivo do DevTools em 360px, 768px e 1280px.',
            'Imagens com max-width: 100% não estouram o layout.',
            'Não remova o outline de foco sem colocar outro indicador visível no lugar.',
          ],
        },
      ],
      checklist: [
        { id: 'css-mobile-first', text: 'A página funciona em 360px sem rolagem horizontal.' },
        { id: 'css-media', text: 'Usei @media para adaptar o layout a telas maiores.' },
        { id: 'css-focus', text: 'Links e botões têm foco visível.' },
        { id: 'css-contrast', text: 'Conferi o contraste dos textos (por exemplo, no DevTools).' },
      ],
    },
    {
      id: 'review',
      title: 'Revise acessibilidade e segurança, e verifique',
      guidance: [
        {
          type: 'paragraph',
          text: 'Percorra os casos de teste do projeto: navegação por teclado, formulário vazio, e-mail inválido e tela pequena. Depois cole o HTML completo na verificação automática abaixo: ela confere a estrutura de verdade, num ambiente isolado.',
        },
      ],
      checklist: [
        { id: 'review-keyboard', text: 'Naveguei pela página inteira só com o teclado.' },
        { id: 'review-links', text: 'Links com target="_blank" têm rel="noopener noreferrer".' },
        { id: 'review-test-cases', text: 'Executei todos os casos de teste do projeto.' },
      ],
    },
  ],
  autoCheck: {
    language: 'html',
    instructions: [
      {
        type: 'paragraph',
        text: 'Cole aqui o conteúdo completo do seu index.html, com o CSS dentro de um <style>. A verificação roda numa prévia isolada, sem scripts nem acesso à rede, e confere o que pode ser verificado automaticamente. Contraste real, ordem de foco e qualidade do conteúdo ficam com a sua autoavaliação.',
      },
    ],
    starterCode: `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <!-- complete o head -->
  </head>
  <body>
    <!-- sua página aqui -->
  </body>
</html>
`,
    tests: [
      {
        id: 'doctype',
        description: 'Começa com <!doctype html>',
        source:
          "expect(/^\\s*<!doctype html>/i.test(source) ? [] : ['o arquivo não começa com <!doctype html>']).toEqual([]);",
      },
      {
        id: 'lang',
        description: 'Declara o idioma em <html lang>',
        source:
          "const doc = new DOMParser().parseFromString(source, 'text/html'); expect((doc.documentElement.getAttribute('lang') || '').trim() ? [] : ['<html> sem atributo lang']).toEqual([]);",
      },
      {
        id: 'title',
        description: 'Tem um <title> com texto',
        source:
          "const doc = new DOMParser().parseFromString(source, 'text/html'); expect((doc.querySelector('title')?.textContent || '').trim() ? [] : ['<title> vazio ou ausente']).toEqual([]);",
      },
      {
        id: 'meta',
        description: 'Tem meta viewport e meta description',
        source:
          "const doc = new DOMParser().parseFromString(source, 'text/html'); const missing = ['viewport', 'description'].filter((n) => !(doc.querySelector('meta[name=\"' + n + '\"]')?.getAttribute('content') || '').trim()); expect(missing).toEqual([]);",
      },
      {
        id: 'landmarks',
        description: 'Usa header, nav, main (um só) e footer',
        source:
          "const missing = ['header', 'nav', 'main', 'footer'].filter((t) => !document.querySelector(t)); expect(missing).toEqual([]); const mains = document.querySelectorAll('main').length; expect(mains > 1 ? [mains + ' elementos <main>'] : []).toEqual([]);",
      },
      {
        id: 'headings',
        description: 'Tem um único h1 e os títulos não pulam níveis',
        source:
          "expect(document.querySelectorAll('h1').length).toBe(1); const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])); const jumps = levels.flatMap((l, i) => (i > 0 && l > levels[i - 1] + 1 ? ['h' + levels[i - 1] + ' → h' + l] : [])); expect(jumps).toEqual([]);",
      },
      {
        id: 'nav-links',
        description: 'A navegação tem links',
        source:
          "expect(document.querySelector('nav a[href]') ? [] : ['<nav> sem links <a href>']).toEqual([]);",
      },
      {
        id: 'img-alt',
        description: 'Toda imagem tem atributo alt',
        source:
          "const semAlt = [...document.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).map((img) => img.getAttribute('src') || '<img>'); expect(semAlt).toEqual([]);",
      },
      {
        id: 'form-labels',
        description: 'O formulário existe e todo campo tem rótulo',
        source:
          "expect(document.querySelector('form') ? [] : ['nenhum <form>']).toEqual([]); const campos = [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]), textarea, select')]; const semRotulo = campos.filter((c) => !(c.closest('label') || (c.id && document.querySelector('label[for=\"' + c.id + '\"]')) || (c.getAttribute('aria-label') || '').trim())).map((c) => '<' + c.tagName.toLowerCase() + (c.name ? ' name=' + c.name : '') + '>'); expect(semRotulo).toEqual([]);",
      },
      {
        id: 'email',
        description: 'Tem um campo de e-mail com type="email" e required',
        source:
          "expect(document.querySelector('input[type=email][required]') ? [] : ['nenhum <input type=\"email\" required>']).toEqual([]);",
      },
      {
        id: 'noopener',
        description: 'Links com target="_blank" têm rel="noopener" (ou noreferrer)',
        source:
          "const inseguros = [...document.querySelectorAll('a[target=_blank]')].filter((a) => !/\\b(noopener|noreferrer)\\b/.test(a.getAttribute('rel') || '')).map((a) => a.getAttribute('href')); expect(inseguros).toEqual([]);",
      },
      {
        id: 'no-inline-js',
        description: 'Não usa atributos de evento inline (onclick, onload…)',
        source:
          "const doc = new DOMParser().parseFromString(source, 'text/html'); const inline = [...doc.querySelectorAll('*')].flatMap((el) => [...el.attributes].filter((a) => a.name.startsWith('on')).map((a) => '<' + el.tagName.toLowerCase() + ' ' + a.name + '>')); expect(inline).toEqual([]);",
      },
      {
        id: 'media-query',
        description: 'O CSS tem pelo menos uma @media',
        source:
          "const temMedia = [...document.styleSheets].some((sheet) => [...sheet.cssRules].some((rule) => 'media' in rule && 'cssRules' in rule)); expect(temMedia ? [] : ['nenhuma regra @media no CSS']).toEqual([]);",
      },
    ],
  },
  completionCriteria: [
    'A verificação automática passa em todos os testes.',
    'Todos os itens do checklist das etapas estão marcados.',
    'A autoavaliação da rubrica está preenchida.',
  ],
  rubric: [
    {
      id: 'semantics',
      title: 'Semântica e estrutura',
      description: 'O HTML descreve o conteúdo, não a aparência.',
      levels: [
        {
          score: 1,
          description: 'Muitos <div> genéricos; títulos escolhidos pelo tamanho da fonte.',
        },
        {
          score: 2,
          description:
            'Landmarks e títulos corretos, com alguns elementos genéricos onde caberia um semântico.',
        },
        {
          score: 3,
          description:
            'Cada elemento foi escolhido pelo significado; a estrutura de títulos funciona como índice.',
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade',
      description: 'A página funciona para quem usa teclado, leitor de tela ou zoom.',
      levels: [
        {
          score: 1,
          description: 'Algum campo sem rótulo, foco invisível ou contraste insuficiente.',
        },
        { score: 2, description: 'Rótulos, alt e foco corretos; contraste conferido em parte.' },
        {
          score: 3,
          description:
            'Navegação por teclado completa, contraste AA conferido e testado com leitor de tela.',
        },
      ],
    },
    {
      id: 'responsive',
      title: 'Responsividade e CSS',
      description: 'O layout se adapta e o CSS é fácil de manter.',
      levels: [
        { score: 1, description: 'Quebra ou gera rolagem horizontal em alguma largura.' },
        {
          score: 2,
          description: 'Funciona em todas as larguras testadas, com valores repetidos no CSS.',
        },
        {
          score: 3,
          description:
            'Mobile first, custom properties para cores e espaçamentos, sem valores mágicos repetidos.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Segurança e boas práticas',
      description: 'Sem brechas simples e sem comportamento escondido no HTML.',
      levels: [
        { score: 1, description: 'Links _blank sem rel ou JavaScript inline.' },
        { score: 2, description: 'Links externos protegidos e nenhum JavaScript inline.' },
        {
          score: 3,
          description:
            'Além disso, sei explicar o risco de tabnabbing e por que CSP bloqueia handlers inline.',
        },
      ],
    },
  ],
  nextSteps: [
    'Publicar a página no GitHub Pages ou em outro serviço estático.',
    'Medir a página com o Lighthouse e corrigir o que aparecer em acessibilidade.',
    'Na fase de JavaScript, adicionar um tema claro/escuro com preferência salva.',
  ],
  competencyIds: ['html-semantics', 'accessibility', 'css-responsive'],
};
