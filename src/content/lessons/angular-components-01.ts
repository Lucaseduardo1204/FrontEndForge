import { Lesson } from '../../app/core/models/content.models';

/** Code blocks here are compiled and tested in `src/content/angular-examples.spec.ts`. */
const TAREFA_ITEM = `import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

@Component({
  selector: 'app-tarefa-item',
  template: \`
    <label>
      <input type="checkbox" [checked]="tarefa().feita" (change)="alternada.emit(tarefa().id)" />
      {{ tarefa().titulo }}
    </label>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarefaItem {
  readonly tarefa = input.required<Tarefa>();
  readonly alternada = output<number>();
}`;

const LISTA_TAREFAS = `import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Tarefa, TarefaItem } from './tarefa-item';

@Component({
  selector: 'app-lista-tarefas',
  imports: [TarefaItem],
  template: \`
    <p>{{ pendentes() }} pendentes</p>
    <ul>
      @for (tarefa of tarefas(); track tarefa.id) {
        <li><app-tarefa-item [tarefa]="tarefa" (alternada)="alternar($event)" /></li>
      } @empty {
        <li>Nenhuma tarefa.</li>
      }
    </ul>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaTarefas {
  readonly tarefas = signal<readonly Tarefa[]>([
    { id: 1, titulo: 'Estudar signals', feita: false },
    { id: 2, titulo: 'Revisar closures', feita: true },
  ]);
  readonly pendentes = computed(() => this.tarefas().filter((t) => !t.feita).length);

  alternar(id: number) {
    this.tarefas.update((lista) =>
      lista.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)),
    );
  }
}`;

export const ANGULAR_COMPONENTS_01: Lesson = {
  id: 'angular-components-01',
  moduleId: 'angular-components-signals',
  title: 'Componentes Angular com inputs, outputs e signals',
  summary:
    'Como dados descem por input(), eventos sobem por output() e o estado vive em signals, num exemplo real de lista de tarefas.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['angular-components', 'angular-signals', 'angular-control-flow'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toda tela Angular é uma árvore de componentes. Os problemas mais comuns de quem começa vêm de não saber quem é dono de cada dado: o filho altera algo que pertence ao pai, a lista não atualiza, o mesmo estado é copiado em três lugares e sai de sincronia.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Passar dados do componente pai para o filho com input().',
            'Avisar o pai de um acontecimento com output().',
            'Guardar estado em signal e derivar valores com computed.',
            'Atualizar listas sem alterar o array original.',
            'Usar @for com track e @empty.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'Dados descem, eventos sobem',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense numa planilha compartilhada da equipe, cuidada por uma pessoa responsável. Quem lê recebe uma cópia para visualizar; quem quer mudar algo não edita a cópia, e sim pede a mudança à responsável, que atualiza a planilha e todos passam a ver a versão nova.',
        },
        {
          type: 'paragraph',
          text: 'No Angular, o componente pai é o responsável pelo estado (um signal). Ele entrega os dados aos filhos por input(); quando algo acontece no filho, ele emite um evento por output(); o pai decide e atualiza o signal; a tela se redesenha sozinha.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'As peças de um componente moderno',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Componentes são standalone por padrão: declaram em imports os componentes que usam no template.',
            'input() cria uma propriedade que o pai preenche; input.required() obriga o pai a informar. O valor é lido como função: tarefa().',
            'output() cria um evento; o filho chama emit(valor) e o pai escuta com (nome)="metodo($event)".',
            'signal() guarda estado que muda; set() substitui o valor e update() calcula o novo a partir do atual.',
            'computed() deriva um valor de outros signals e só recalcula quando eles mudam.',
            '@for percorre listas e exige track: uma identidade estável (como o id) para o Angular reaproveitar os elementos certos; @empty é o que aparece quando a lista está vazia.',
            'ChangeDetectionStrategy.OnPush faz o componente ser atualizado quando um signal lido no template muda, um input muda ou um evento acontece no template, sem verificações desnecessárias.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Signals não percebem mutações',
          text: 'Alterar o array por dentro (push, ou mudar uma propriedade de um objeto da lista) não avisa o signal. Use update para produzir um array novo. Tipar como readonly Tarefa[] faz o compilador recusar push.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: lista de tarefas',
      blocks: [
        {
          type: 'paragraph',
          text: 'O componente de apresentação recebe uma tarefa e avisa quando ela é marcada. Ele não sabe de onde a tarefa veio nem como a lista é guardada.',
        },
        { type: 'code', language: 'typescript', caption: 'tarefa-item.ts', code: TAREFA_ITEM },
        {
          type: 'paragraph',
          text: 'O contêiner é dono do estado: guarda a lista num signal, deriva quantas estão pendentes e trata o evento do filho criando uma lista nova.',
        },
        { type: 'code', language: 'typescript', caption: 'lista-tarefas.ts', code: LISTA_TAREFAS },
        {
          type: 'list',
          ordered: true,
          items: [
            'O usuário marca a caixa: o filho executa alternada.emit(tarefa().id).',
            'O pai recebe o id em alternar($event) e chama update, que devolve um array novo com a tarefa trocada.',
            'O signal tarefas avisa quem depende dele: o computed pendentes recalcula e o template se redesenha.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'Os dois componentes acima são compilados e executados pelos testes da plataforma, com a mesma versão do Angular que ela usa. Se uma API mudar, o teste falha antes de o conteúdo ficar desatualizado.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'paragraph',
          text: 'O laboratório da plataforma ainda não executa Angular, então este experimento é feito na sua máquina, com Node.js instalado:',
        },
        {
          type: 'code',
          language: 'shell',
          caption: 'Terminal',
          code: `npx @angular/cli@latest new minha-lista
cd minha-lista
npx ng generate component tarefa-item
npx ng generate component lista-tarefas
npx ng serve`,
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Cole os componentes do exemplo nos arquivos gerados e use <app-lista-tarefas /> no template do componente principal.',
            'Troque track tarefa.id por track tarefa, marque uma tarefa usando o teclado (Tab e espaço) e veja para onde vai o foco. Volte para tarefa.id e repita.',
            'Crie um método de adicionar e tente this.tarefas().push(...): o que o compilador diz? Reescreva com update.',
            'Remova .required do input e veja o erro de tipo que aparece no template do filho.',
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
          text: 'Responda pensando no exemplo da lista de tarefas.',
        },
      ],
      exerciseIds: ['ng-input-output', 'ng-data-flow-order'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o filho que tenta mandar no dado',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'Tentativa no TarefaItem',
          code: `marcar() {
  this.tarefa.set({ ...this.tarefa(), feita: true }); // erro de compilação
}`,
        },
      ],
      exerciseIds: ['ng-input-readonly'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Componentes de apresentação (como TarefaItem) são fáceis de reutilizar e testar: entram dados, saem eventos.',
            'Contêineres (geralmente as páginas) injetam services, guardam o estado e conectam os filhos.',
            'Quando o estado precisa ser compartilhado entre páginas, ele sobe para um service com signals, e os componentes passam a ler de lá.',
            'Esta própria plataforma segue esse padrão: os cartões da central de comando recebem dados por input() e a página monta tudo a partir do progresso salvo.',
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
      exerciseIds: ['ng-computed-predict', 'ng-track', 'ng-effect-misuse'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Dados descem por input() (somente leitura no filho); eventos sobem por output().',
            'O dono do estado é quem o altera: o filho pede, o pai decide.',
            'signal guarda estado; computed deriva; update cria o valor novo sem alterar o antigo.',
            '@for exige track com uma identidade estável; @empty cobre a lista vazia.',
            'effect serve para efeitos colaterais, não para copiar estado: para derivar, use computed.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Signals no Angular", "Signals ou RxJS?" e "Componentes de apresentação e de contêiner".',
        },
      ],
    },
  ],
};
