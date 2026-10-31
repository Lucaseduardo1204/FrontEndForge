import { Lesson } from '../../app/core/models/content.models';

/**
 * Angular's behaviour shown here (escaping, [innerHTML] sanitization, unsafe: prefix, bypass)
 * is executed in `src/content/security-examples.spec.ts` with the Angular of this project.
 */
export const ATTACK_TEXT = `<img src="x" onerror="alert(1)"><b>negrito</b><script>alert(2)</script>`;

export const SAFE_TEMPLATE_HTML = `<!-- 1. Interpolação: o texto aparece literalmente, nada é interpretado -->
<p>{{ comentario.texto }}</p>

<!-- 2. [innerHTML]: o Angular sanitiza; remove onerror e <script>, mantém <b> -->
<div [innerHTML]="comentario.textoFormatado"></div>

<!-- 3. [href]: URLs javascript: viram unsafe:javascript: e não executam -->
<a [href]="comentario.site">Site do autor</a>`;

export const BYPASS_VULNERABLE_TS = `// VULNERÁVEL: desliga a sanitização para um texto que veio do usuário.
private readonly sanitizer = inject(DomSanitizer);
readonly html = computed(() =>
  this.sanitizer.bypassSecurityTrustHtml(this.comentario().texto),
);`;

export const SAFE_URL_TS = `/** Aceita só links http(s), mailto e caminhos do próprio site; o resto vira null. */
export function urlSegura(entrada: string): string | null {
  try {
    const url = new URL(entrada.trim(), 'https://exemplo.invalid');
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? entrada.trim() : null;
  } catch {
    return null;
  }
}`;

export const SECURITY_XSS_01: Lesson = {
  id: 'security-xss-01',
  moduleId: 'security-injection',
  title: 'XSS, sanitização do Angular e Content Security Policy',
  summary:
    'Como um texto vira código na página dos outros, o que o Angular faz para impedir, como você pode desligar essa proteção sem perceber e qual é a segunda barreira.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['web-xss', 'angular-sanitization', 'web-csp'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'XSS (cross-site scripting) é quando um dado vindo de alguém (um comentário, um nome, um link) é interpretado como código no navegador de outra pessoa. Esse código roda com os mesmos poderes da aplicação: lê o que está na tela, faz requisições em nome da vítima e altera a página. Continua entre as falhas mais encontradas na web.',
        },
        {
          type: 'paragraph',
          text: 'Comece pelo modelo de ameaças: quem pode colocar dados na aplicação (qualquer pessoa cadastrada? qualquer visitante?), onde esses dados aparecem e para quem. Um campo "nome" que aparece no painel do administrador é uma entrada controlada por estranhos e exibida para quem tem mais poder.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Reconhecer os lugares onde texto vira HTML ou código.',
            'Saber o que a interpolação e a sanitização do Angular fazem, e o que não fazem.',
            'Identificar quando a proteção é desligada (bypassSecurityTrust, innerHTML fora do Angular).',
            'Validar links fornecidos por usuários.',
            'Entender a Content Security Policy como segunda barreira, e os limites dela.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O quadro de avisos do condomínio',
      blocks: [
        {
          type: 'paragraph',
          text: 'Imagine um quadro de avisos em que cada morador deixa um papel. Se o síndico lê os avisos em voz alta, tudo bem: são só textos. Mas se o síndico executa o que está escrito ("entregue as chaves da portaria a quem pedir"), qualquer morador passa a mandar no prédio.',
        },
        {
          type: 'paragraph',
          text: 'XSS é o síndico executando os avisos. A defesa principal é tratar dados sempre como texto. A Content Security Policy é a regra extra: mesmo que um aviso chegue a ser executado, o prédio só aceita ordens de quem está numa lista.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Onde texto vira código, e as defesas',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Interpolação {{ }} e property bindings comuns tratam o valor como texto: <img onerror> aparece literalmente na tela.',
            '[innerHTML] passa pelo sanitizador do Angular: atributos de evento (onerror, onclick...) e <script> são removidos, formatação simples (<b>, <p>, <a>) fica. O Angular avisa no console quando remove algo.',
            'Bindings de URL ([href], [src]) bloqueiam esquemas perigosos: javascript:alert(1) vira unsafe:javascript:alert(1), que não executa.',
            'bypassSecurityTrustHtml (e as variantes de URL, estilo e script) desligam a sanitização. Só faz sentido com conteúdo que você controla de ponta a ponta, nunca com algo que veio de usuário ou de API externa.',
            'Fora do template, o Angular não protege: element.innerHTML, insertAdjacentHTML, document.write e new Function com dados de usuário são XSS esperando para acontecer. Use textContent e criação de elementos (como na lição de DOM).',
            'Validação de entrada não substitui o tratamento na saída: um nome pode conter < e > legitimamente. Valide formato (é um e-mail? um link http?) e trate tudo como texto ao exibir.',
            'Links vindos de usuários: aceite só os esquemas esperados (http, https, mailto) com uma lista de permitidos, usando new URL para interpretar como o navegador interpretaria.',
            "Content Security Policy (CSP) é um cabeçalho em que o servidor diz de onde scripts, estilos e conexões podem vir. Uma política como script-src 'self' impede scripts inline injetados de executar. É a segunda barreira, não a primeira.",
          ],
        },
        {
          type: 'callout',
          tone: 'security',
          title: 'O que esta plataforma descobriu ao medir CSP',
          text: 'Uma CSP que restringe scripts quebrou o laboratório desta plataforma, porque a prévia e o executor herdam a política da página e precisam avaliar o código do estudante. A solução recomendada (servir os executores em outra origem) e a política que funciona hoje estão documentadas no README. CSP exige teste: uma política copiada sem medir pode quebrar a aplicação, ou, solta demais, não proteger nada.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: comentários com formatação e link',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um comentário com este texto chega da API. Veja o que cada forma de exibi-lo faz:',
        },
        { type: 'code', language: 'html', caption: 'Texto enviado por alguém', code: ATTACK_TEXT },
        { type: 'code', language: 'html', caption: 'comentario.html', code: SAFE_TEMPLATE_HTML },
        {
          type: 'paragraph',
          text: 'Com [innerHTML], o que chega ao DOM é <img src="x"><b>negrito</b>: sem onerror e sem script. Agora a versão que desliga a proteção, que aparece em código real "para a formatação funcionar":',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'Vulnerável: não use',
          code: BYPASS_VULNERABLE_TS,
        },
        {
          type: 'paragraph',
          text: 'Com bypassSecurityTrustHtml, o HTML entra inteiro, com onerror e <script>. A correção é simplesmente usar [innerHTML] sem bypass; se for preciso mais formatação do que o sanitizador permite, converta um formato restrito (como Markdown) com uma biblioteca que gere HTML seguro, e ainda assim passe pelo sanitizador.',
        },
        {
          type: 'paragraph',
          text: 'Para o link do perfil, valide antes de exibir com uma lista de esquemas permitidos:',
        },
        { type: 'code', language: 'typescript', caption: 'url-segura.ts', code: SAFE_URL_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este comportamento é testado',
          text: 'Os testes da plataforma renderizam esse comentário com o Angular usado no projeto e conferem: o texto literal na interpolação, onerror e script removidos pelo [innerHTML], o prefixo unsafe: no link e o HTML intacto com bypassSecurityTrustHtml.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Num projeto Angular, exiba o texto do exemplo com {{ }}, com [innerHTML] e com bypassSecurityTrustHtml (use alert só no seu ambiente local). Abra o console e leia os avisos de sanitização.',
            'Inspecione o DOM de cada versão no DevTools e compare com o texto original.',
            'Passe "javascript:alert(1)", "  JavaScript:alert(1)" e "https://exemplo.com" para urlSegura e para um [href]. Compare os resultados.',
            "Em um servidor local, envie o cabeçalho Content-Security-Policy: script-src 'self' e tente executar um <script> inline: leia a mensagem de violação no console.",
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
          text: 'No laboratório, escreva a função que valida links vindos de usuários. Depois, responda sobre a sanitização do Angular.',
        },
      ],
      exerciseIds: ['lab-js-safe-url', 'xss-01-sanitizer'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a formatação que abriu uma brecha',
      blocks: [
        { type: 'code', language: 'typescript', caption: 'Vulnerável', code: BYPASS_VULNERABLE_TS },
      ],
      exerciseIds: ['xss-01-bypass'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Em revisões de código, procure por bypassSecurityTrust, innerHTML, insertAdjacentHTML, eval e new Function: cada ocorrência precisa de uma justificativa.',
            'Bibliotecas de editor de texto rico e de gráficos às vezes inserem HTML por conta própria; confira como tratam dados de usuário.',
            'O lint pode ajudar: regras que proíbem innerHTML e bypassSecurityTrust tornam a exceção visível.',
            'A lição de DOM mostrou o mesmo ataque em JavaScript puro; no Angular a proteção é padrão, e o risco está em desligá-la.',
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
      exerciseIds: ['xss-01-href', 'xss-01-outside-angular', 'xss-01-csp'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Dado de usuário é texto: interpolação, textContent, [innerHTML] com sanitização.',
            'bypassSecurityTrust desliga a proteção: nunca com dados de usuário.',
            'Fora do template, o Angular não protege (innerHTML direto, eval, new Function).',
            'Links de usuários: lista de esquemas permitidos com new URL.',
            'CSP é a segunda barreira, e precisa ser testada.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "XSS (Cross-Site Scripting)", "textContent ou innerHTML?" e "Segurança no frontend: o essencial".',
        },
      ],
    },
  ],
};
