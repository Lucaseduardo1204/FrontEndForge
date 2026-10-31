import { Lesson } from '../../app/core/models/content.models';

/** Executed with RxJS 7.8 and the Angular of this project in `src/content/angular-rxjs.spec.ts`. */
export const COLD_TS = `const precos$ = new Observable<number>((assinante) => {
  console.log('buscando preços');      // só roda quando alguém assina
  assinante.next(10);
  assinante.next(12);
  assinante.complete();
});

console.log('antes de assinar');
precos$.subscribe((p) => console.log('preço', p));
precos$.subscribe((p) => console.log('preço', p)); // roda tudo de novo`;

export const SEARCH_TS = `@Component({
  selector: 'app-busca-clientes',
  template: \`
    <label for="busca">Buscar cliente</label>
    <input id="busca" type="search" (input)="termo.set($any($event.target).value)" />
    <ul>
      @for (cliente of resultados(); track cliente.id) {
        <li>{{ cliente.nome }}</li>
      }
    </ul>
  \`,
})
export class BuscaClientes {
  private readonly http = inject(HttpClient);
  readonly termo = signal('');

  readonly resultados = toSignal(
    toObservable(this.termo).pipe(
      map((t) => t.trim()),
      debounceTime(300),               // espera a pessoa parar de digitar
      distinctUntilChanged(),          // ignora o mesmo termo de novo
      switchMap((t) =>                 // cancela a busca anterior
        t.length < 2
          ? of([])
          : this.http.get<Cliente[]>('/api/clientes', { params: { busca: t } }).pipe(
              catchError(() => of([])), // dentro do switchMap: a busca continua viva
            ),
      ),
    ),
    { initialValue: [] },
  );
}`;

export const DEAD_STREAM_TS = `// Bug: catchError fora do switchMap.
toObservable(this.termo).pipe(
  debounceTime(300),
  switchMap((t) => this.http.get<Cliente[]>('/api/clientes', { params: { busca: t } })),
  catchError(() => of([])),
);`;

export const ANGULAR_RXJS_01: Lesson = {
  id: 'angular-rxjs-01',
  moduleId: 'angular-rxjs-signals',
  title: 'RxJS no Angular: Observables, operadores e a ponte com signals',
  summary:
    'Quando usar RxJS em vez de signals, como compor eventos no tempo (esperar a digitação, cancelar o que ficou velho, se recuperar de erros) e como não deixar assinaturas vazando.',
  estimatedMinutes: 50,
  difficulty: 'advanced',
  conceptIds: ['angular-rxjs', 'js-async-races'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Signals guardam estado: um valor que existe agora e muda de vez em quando. Mas algumas coisas são fluxos de eventos no tempo: o que a pessoa digita, as respostas que chegam, os cliques. Para esperar uma pausa na digitação, cancelar uma busca velha ou tentar de novo depois de um erro, o Angular usa RxJS, e o HttpClient devolve Observables.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Entender o que é um Observable e por que ele é "frio".',
            'Usar os operadores mais comuns: map, filter, debounceTime, distinctUntilChanged, switchMap, catchError.',
            'Ligar signals e Observables com toObservable e toSignal.',
            'Evitar assinaturas que vazam e fluxos que morrem no primeiro erro.',
            'Escolher entre signals, httpResource e RxJS.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A esteira da fábrica',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um Observable é uma esteira de fábrica: itens passam um a um, ao longo do tempo. Os operadores são estações na esteira: uma filtra, outra transforma, outra espera juntar, outra descarta o que ficou velho. Nada se move enquanto ninguém liga a esteira (a assinatura). E se uma estação quebra sem conserto, a esteira inteira para.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Observables, operadores e a ponte com signals',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Um Observable produz zero ou mais valores ao longo do tempo e pode terminar (complete) ou falhar (error).',
            'Observables comuns são frios: o código só roda quando alguém assina (subscribe), e roda de novo para cada assinatura. O HttpClient segue essa regra: sem assinar, nenhuma requisição sai; assinando duas vezes, saem duas.',
            'pipe encadeia operadores. map transforma; filter descarta; debounceTime espera um intervalo sem novos valores; distinctUntilChanged ignora valores repetidos em sequência.',
            'switchMap troca o fluxo interno a cada valor novo e cancela o anterior: a resposta de um termo velho nunca chega à tela.',
            'Um erro termina o fluxo. Um catchError depois do switchMap troca o fluxo inteiro por um valor de recuperação e encerra a busca para sempre; dentro do switchMap, só aquela requisição é substituída e a busca continua.',
            'toObservable(signal) transforma um signal em Observable; toSignal(observable) faz o caminho inverso, assina sozinho e cancela a assinatura quando o componente é destruído.',
            'Assinaturas manuais (.subscribe) precisam ser canceladas: takeUntilDestroyed() no pipe faz isso quando o componente é destruído.',
            'Quando usar o quê: estado e valores derivados, signals; ler dados que dependem de um signal, httpResource; compor eventos no tempo (esperar, cancelar, combinar, tentar de novo), RxJS. O Angular 22 também tem rxResource para quem já tem a leitura escrita como Observable.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: busca de clientes com debounce e cancelamento',
      blocks: [
        {
          type: 'paragraph',
          text: 'Primeiro, o que "frio" significa na prática. O console mostra "antes de assinar" primeiro, e "buscando preços" duas vezes, uma por assinatura:',
        },
        { type: 'code', language: 'typescript', caption: 'frio.ts', code: COLD_TS },
        {
          type: 'paragraph',
          text: 'A busca: o signal do campo vira Observable, passa pelas estações e volta como signal para o template.',
        },
        { type: 'code', language: 'typescript', caption: 'busca-clientes.ts', code: SEARCH_TS },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'Os testes da plataforma executam este componente com o Angular e o RxJS do projeto: digitar "c", "ca" e "caf" depressa gera uma única requisição; um termo novo cancela a requisição em andamento; repetir o termo não gera outra; uma resposta 500 não derruba a busca; e a assinatura termina quando o componente é destruído.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Rode o exemplo "frio" e confira a ordem do console. Troque o Observable por uma Promise e compare quando "buscando preços" aparece.',
            'Na busca, tire o debounceTime e digite rápido com a aba Rede aberta.',
            'Troque switchMap por mergeMap, ative a limitação "3G lenta" e digite: as respostas chegam fora de ordem?',
            'Mova o catchError para fora do switchMap, force um erro (uma URL inválida) e tente buscar de novo.',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [{ type: 'paragraph', text: 'Responda pensando na busca de clientes.' }],
      exerciseIds: ['rxjs-01-cold', 'rxjs-01-operators'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a busca que para de funcionar',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depois de uma falha do servidor, a busca nunca mais faz requisições, não importa o que se digite.',
        },
        { type: 'code', language: 'typescript', caption: 'Com bug', code: DEAD_STREAM_TS },
      ],
      exerciseIds: ['rxjs-01-dead-stream'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Projetos Angular mais antigos usam RxJS para quase tudo, inclusive estado; ao migrar, estado vira signal e RxJS fica para fluxos de eventos.',
            'Esta plataforma segue essa divisão: estado em signals; RxJS só onde há fluxo assíncrono de verdade, como manda a regra do projeto.',
            'Formulários reativos expõem valueChanges como Observable; toSignal o transforma em signal (o modo foco desta plataforma faz isso para a prévia do plano).',
            'Operadores como retry, combineLatest e takeUntil resolvem casos que seriam longos de escrever à mão.',
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
      exerciseIds: ['rxjs-01-switchmap', 'rxjs-01-choose', 'rxjs-01-leak'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Observables frios só rodam ao serem assinados, uma vez por assinatura.',
            'debounceTime espera, distinctUntilChanged descarta repetidos, switchMap cancela o velho.',
            'catchError dentro do switchMap mantém a busca viva.',
            'toObservable e toSignal ligam os dois mundos; toSignal e takeUntilDestroyed limpam as assinaturas.',
            'Estado em signals; eventos no tempo em RxJS.',
          ],
        },
        { type: 'paragraph', text: 'Na Biblioteca: "Signals ou RxJS?".' },
      ],
    },
  ],
};
