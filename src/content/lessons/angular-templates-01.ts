import { Lesson } from '../../app/core/models/content.models';

/**
 * Compiled and executed with this project's Angular in `src/content/angular-templates.spec.ts`
 * (drift guard included). Behaviours measured there (D-069).
 */
export const BINDINGS_TEMPLATE = `<p>{{ comentario }}</p>

<button
  type="button"
  [attr.aria-expanded]="aberto()"
  [class.ativo]="aberto()"
  (click)="aberto.set(!aberto())"
>
  Filtros
</button>

<button type="button" [aria-pressed]="favorito()" (click)="favorito.set(!favorito())">
  Favorito
</button>

@let quantidade = itens().length;
<p>{{ quantidade }} itens · total {{ itens() | soma }}</p>

<input aria-label="Novo item" (keydown.enter)="adicionar($any($event.target).value)" />`;

export const PURE_PIPE_TS = `@Pipe({ name: 'soma' })
export class SomaPipe implements PipeTransform {
  // Pipe puro (o padrão): só roda de novo quando a referência do argumento muda.
  transform(valores: readonly number[]): number {
    return valores.reduce((total, v) => total + v, 0);
  }
}`;

export const ANGULAR_TEMPLATES_01: Lesson = {
  id: 'angular-templates-01',
  moduleId: 'angular-templates-bindings',
  title: 'Templates: bindings, pipes, @let e eventos',
  summary:
    'O que cada tipo de binding faz no DOM, por que interpolação é segura, como pipes puros decidem quando recalcular e os detalhes que quebram a formatação de moeda.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['angular-templates', 'angular-pipes'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'O template é onde o estado vira tela. Pequenas diferenças decidem muito: um atributo ARIA que aparece como "false" ou some, um pipe que mostra um total velho, uma moeda formatada como R$1,234.50 numa aplicação brasileira, um campo que reage a qualquer tecla em vez de só ao Enter.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Distinguir interpolação, binding de propriedade, de atributo, de classe e de estilo.',
            'Entender por que a interpolação protege contra HTML injetado.',
            'Criar pipes puros e saber quando eles recalculam.',
            'Usar @let para nomear valores no template.',
            'Filtrar eventos de teclado e configurar o locale.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O formulário preenchido à máquina',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense no template como um formulário pré-impresso: os campos ({{ }} e [ ]) são preenchidos a partir do estado, e as caixas de seleção (eventos) devolvem o que a pessoa marcou. Um pipe é o carimbo de formatação: se o papel não mudou, ninguém carimba de novo.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Bindings, pipes e eventos',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Interpolação ({{ }}) insere texto. Medido: o valor "<b>negrito</b>" apareceu como texto, sem criar o elemento <b>. É por isso que exibir dado do usuário com interpolação é seguro (lição de XSS).',
            '[propriedade] escreve na propriedade do elemento: [disabled]="false" deixou o botão habilitado e sem atributo; [disabled]="true" criou o atributo disabled.',
            '[attr.nome] escreve o atributo: medido, [attr.aria-expanded]="false" gerou aria-expanded="false" (o texto, correto para ARIA), e [attr.data-x]="null" removeu o atributo.',
            'Atributos ARIA também aceitam binding direto nesta versão: [aria-pressed]="true" gerou aria-pressed="true".',
            '[class.ativo]="condicao" liga e desliga uma classe; [style.width.px]="120" gerou width: 120px.',
            '@let nome = expressao; dá nome a um valor dentro do template, sem precisar de um campo no componente.',
            'Pipes puros (o padrão) só rodam de novo quando a referência do argumento muda. Medido com um pipe de soma: a mudança de outro signal não o executou; um push no mesmo array também não, e a tela continuou mostrando 6 quando a soma real era 10; um array novo o executou e mostrou 15. Signals com update e arrays novos resolvem.',
            '(keydown.enter) só dispara no Enter: medido, uma tecla "a" seguida de Enter contou uma vez.',
            'Pipes de data e moeda dependem do locale. Medido: com LOCALE_ID pt-BR e sem os dados do locale registrados, o Angular lançou NG0701; sem LOCALE_ID, currency: "BRL" formatou como "R$1,234.50", no padrão dos Estados Unidos. Registre os dados com registerLocaleData e defina LOCALE_ID.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: uma barra de filtros com total',
      blocks: [
        { type: 'code', language: 'html', caption: 'filtros.html', code: BINDINGS_TEMPLATE },
        { type: 'code', language: 'typescript', caption: 'soma.pipe.ts', code: PURE_PIPE_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é executado',
          text: 'Os testes da plataforma montam este template com o pipe, conferem os atributos gerados, o texto escapado, o @let, o filtro de Enter e quantas vezes o pipe roda em cada situação, e medem a formatação de moeda com e sem locale.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Experimente',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'No exemplo, troque [attr.aria-expanded] por [attr.aria-expanded]="aberto() || null" e veja o atributo sumir quando fechado. Por que isso seria errado para um botão de expandir?',
            'Coloque um console.log no transform do pipe e altere os itens com push e com update.',
            'Remova o registerLocaleData de um projeto e veja a mensagem NG0701.',
            'Troque (keydown.enter) por (keydown.shift.enter).',
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
          text: 'No laboratório, escreva a lógica de um pipe de tempo relativo ("há 3 minutos", "ontem") com Intl. Depois, responda sobre bindings de atributo.',
        },
      ],
      exerciseIds: ['lab-js-relative-time', 'templates-01-attr'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o total que não atualiza',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption:
            'Depois de adicionar um item, a lista mostra o item novo, mas o total do pipe não muda',
          code: `adicionar(valor: number) {
  this.itens().push(valor);
  this.contador.update((c) => c + 1); // outro signal, para "forçar" a atualização
}`,
        },
      ],
      exerciseIds: ['templates-01-stale-pipe'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Esta plataforma registra o locale pt (registerLocaleData) para os pipes de data e moeda.',
            'Pipes puros são uma forma barata de memoização no template: para valores derivados do componente, computed costuma ser mais claro.',
            'aria-expanded, aria-pressed e aria-current precisam do texto "true" ou "false"; remover o atributo muda o significado.',
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
      exerciseIds: ['templates-01-escape', 'templates-01-locale', 'templates-01-disabled'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Interpolação é texto: HTML não é interpretado.',
            '[prop] para propriedades; [attr.x] para atributos (null remove).',
            'Pipes puros recalculam só com uma referência nova.',
            '@let nomeia valores no template.',
            'Locale registrado e LOCALE_ID definido antes de formatar moeda.',
          ],
        },
      ],
    },
  ],
};
