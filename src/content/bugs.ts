import { BugEntry } from '../app/core/models/content.models';

/** Bug bestiary. Each entry has a diagnosis challenge answered before the cause is shown. */
export const BUGS: readonly BugEntry[] = [
  {
    id: 'bug-closure-var-loop',
    title: 'Todos os callbacks veem o último valor',
    technology: 'javascript',
    difficulty: 'introductory',
    symptom:
      'Um laço registra três callbacks (timers ou listeners de clique), mas todos usam o mesmo valor: o último do laço.',
    problematicCode: {
      language: 'javascript',
      code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    },
    reproduction: [
      'Cole o código no console do navegador (F12 → Console).',
      'Observe a saída: o mesmo número aparece três vezes.',
    ],
    investigation: [
      'Adicione console.log(i) logo depois do laço: qual valor aparece, e antes ou depois dos callbacks?',
      'Troque setTimeout por uma chamada direta da função: o resultado muda? O que isso diz sobre o momento em que o callback executa?',
      'Troque var por let e compare.',
    ],
    diagnosisExerciseId: 'bug-closure-var-loop-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'Dois fatores se combinam. Primeiro, var tem escopo de função: existe uma única variável i, compartilhada por todas as iterações. Segundo, os callbacks são closures que capturam a variável, não o valor dela naquele momento, e só executam depois que o laço termina, quando i já vale 3.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'javascript',
        caption: 'Correção: let cria uma variável nova a cada iteração',
        code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}`,
      },
    ],
    prevention: [
      'Use let e const; habilite a regra no-var do ESLint.',
      'Lembre que closures capturam variáveis, não valores: pergunte "qual será o valor quando o callback executar?".',
    ],
    conceptIds: ['js-closures'],
  },
  {
    id: 'bug-undefined-property',
    title: 'Cannot read properties of undefined',
    technology: 'javascript',
    difficulty: 'introductory',
    symptom:
      'A tela quebra com "TypeError: Cannot read properties of undefined (reading \'cidade\')" para alguns usuários, mas não para todos.',
    problematicCode: {
      language: 'javascript',
      code: `function cidadeDoUsuario(usuario) {
  return usuario.endereco.cidade.toUpperCase();
}

cidadeDoUsuario({ nome: 'Ana' }); // usuário sem endereço cadastrado`,
    },
    reproduction: [
      'Chame a função com um usuário que não tem endereco.',
      'O erro aparece; com um usuário completo, funciona. Bugs que dependem dos dados costumam escapar dos testes com dados "perfeitos".',
    ],
    investigation: [
      'Leia a mensagem com atenção: "reading \'cidade\'" diz qual propriedade estava sendo lida.',
      'No DevTools, marque "Pause on exceptions" e inspecione usuario no momento do erro.',
      'Descubra se a falta de endereço é um caso válido do domínio ou um dado corrompido.',
    ],
    diagnosisExerciseId: 'bug-undefined-property-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'O código supõe que todo usuário tem endereço. Para um usuário sem endereço, usuario.endereco é undefined, e ler .cidade de undefined lança TypeError. O erro não está na linha em si, e sim na suposição sobre o formato dos dados.',
      },
    ],
    fix: [
      {
        type: 'paragraph',
        text: 'A correção depende da regra de negócio. Se o endereço é opcional, trate a ausência explicitamente:',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `function cidadeDoUsuario(usuario) {
  // ?. para de avaliar ao encontrar null/undefined; ?? define o valor padrão.
  return usuario.endereco?.cidade?.toUpperCase() ?? 'Cidade não informada';
}`,
      },
      {
        type: 'paragraph',
        text: 'Se o endereço é obrigatório, encher o código de ?. só esconde o problema: valide os dados na entrada (na resposta da API, no formulário) e falhe com uma mensagem clara.',
      },
    ],
    prevention: [
      'Com TypeScript em modo strict, declare campos opcionais (endereco?: Endereco): o compilador obriga a tratar a ausência.',
      'Teste com dados incompletos, não só com o "usuário perfeito".',
    ],
    conceptIds: ['js-null-undefined'],
  },
  {
    id: 'bug-sort-mutation',
    title: 'A lista original mudou sozinha',
    technology: 'javascript',
    difficulty: 'introductory',
    symptom:
      'Depois de exibir um ranking ordenado, a lista original, usada em outra parte da tela, também aparece reordenada.',
    problematicCode: {
      language: 'javascript',
      code: `const notas = [7, 10, 3];
const ordenadas = notas.sort((a, b) => b - a);
console.log(notas); // a lista original também mudou`,
    },
    reproduction: [
      'Execute o código e compare notas antes e depois do sort.',
      'Compare as referências: ordenadas === notas.',
    ],
    investigation: [
      'Confira na documentação se o método altera o array (in place) ou devolve um novo.',
      'Teste ordenadas === notas: se for true, é o mesmo array.',
    ],
    diagnosisExerciseId: 'bug-sort-mutation-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'Array.prototype.sort ordena o próprio array e devolve a mesma referência. Qualquer outra parte do código que tenha esse array vê a mudança. const não ajuda: ele impede reatribuir a variável, não alterar o conteúdo.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'javascript',
        code: `const ordenadas = [...notas].sort((a, b) => b - a); // ordena uma cópia
// ou, nos navegadores atuais (ES2023):
const ordenadas2 = notas.toSorted((a, b) => b - a);`,
      },
    ],
    prevention: [
      'Saiba quais métodos alteram o array: sort, reverse, splice, push, pop. As versões toSorted, toReversed e toSpliced devolvem cópias.',
      'Em TypeScript, readonly number[] faz o compilador recusar sort no array original.',
    ],
    conceptIds: ['js-mutability'],
  },
  {
    id: 'bug-async-foreach',
    title: 'O total sai zerado com async no forEach',
    technology: 'javascript',
    difficulty: 'intermediate',
    symptom:
      'O código busca os preços de vários itens e soma, mas o total exibido é 0. Às vezes o valor certo aparece "depois", em outro lugar.',
    problematicCode: {
      language: 'javascript',
      code: `const ids = [1, 2, 3];
let total = 0;

ids.forEach(async (id) => {
  const preco = await buscarPreco(id);
  total += preco;
});

console.log(total); // 0`,
    },
    reproduction: [
      'Simule buscarPreco com: const buscarPreco = () => new Promise((r) => setTimeout(() => r(10), 100));',
      'Execute e veja o 0. Depois, aguarde e imprima total de novo: agora vale 30.',
    ],
    investigation: [
      'Adicione logs antes e depois do await, dentro do callback, e outro depois do forEach: anote a ordem em que aparecem.',
      'Veja o que forEach faz com o valor retornado pelo callback (nada).',
    ],
    diagnosisExerciseId: 'bug-async-foreach-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'Uma função async devolve uma Promise assim que chega ao primeiro await. forEach chama o callback três vezes, ignora as três Promises e termina. O console.log roda em seguida, antes de qualquer busca terminar.',
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Uma variação ainda pior',
        text: 'Se o callback fosse escrito como total += await buscarPreco(id), o total final seria 10, não 30. O += lê total antes do await; as três chamadas leem 0 enquanto esperam e, ao voltar, cada uma grava 0 + 10. É uma condição de corrida: atualizações concorrentes que se sobrescrevem.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'javascript',
        caption: 'Em paralelo (as buscas são independentes)',
        code: `const precos = await Promise.all(ids.map((id) => buscarPreco(id)));
const total = precos.reduce((soma, preco) => soma + preco, 0);`,
      },
      {
        type: 'code',
        language: 'javascript',
        caption: 'Em sequência (quando a ordem importa)',
        code: `let total = 0;
for (const id of ids) {
  total += await buscarPreco(id);
}`,
      },
    ],
    prevention: [
      'Não use async dentro de forEach. Use for...of (sequencial) ou Promise.all com map (paralelo).',
      'A regra @typescript-eslint/no-misused-promises aponta esse erro no editor.',
    ],
    conceptIds: ['js-async'],
  },
  {
    id: 'bug-signal-mutation',
    title: 'A tela não atualiza depois do push',
    technology: 'angular',
    difficulty: 'intermediate',
    symptom:
      'Ao adicionar uma tarefa, ela não aparece na lista. Em projetos com detecção de mudanças padrão, às vezes aparece depois de outro clique, o que deixa o bug ainda mais confuso.',
    problematicCode: {
      language: 'typescript',
      code: `@Component({
  selector: 'app-lista',
  template: \`
    <button type="button" (click)="adicionar('Nova tarefa')">Adicionar</button>
    <ul>
      @for (tarefa of tarefas(); track $index) {
        <li>{{ tarefa }}</li>
      }
    </ul>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lista {
  readonly tarefas = signal<string[]>([]);

  adicionar(titulo: string) {
    this.tarefas().push(titulo);
  }
}`,
    },
    reproduction: [
      'Numa aplicação zoneless (o padrão em projetos novos do Angular), clique em Adicionar.',
      'A lista continua vazia, embora tarefas() já contenha o item quando inspecionado no console.',
    ],
    investigation: [
      'Crie um computed(() => this.tarefas().length) e mostre no template: ele também não muda.',
      'Pergunte: em que momento o signal foi avisado de que o valor mudou?',
    ],
    diagnosisExerciseId: 'bug-signal-mutation-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'Signals notificam os dependentes quando o valor é trocado por set ou update. tarefas() devolve o array, e push altera esse objeto por fora: o signal nunca fica sabendo. Templates, computed e effects que dependem dele não são reavaliados.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly tarefas = signal<readonly string[]>([]);

adicionar(titulo: string) {
  // update cria um array novo: o signal notifica quem depende dele.
  this.tarefas.update((lista) => [...lista, titulo]);
}`,
      },
    ],
    prevention: [
      'Trate o valor de um signal como imutável: troque por um novo com set ou update.',
      'Tipar como readonly string[] faz o compilador recusar push, sort e splice no valor do signal.',
      'Não use detectChanges() para "consertar" a tela: ele esconde a causa.',
    ],
    conceptIds: ['angular-signals'],
  },
  {
    id: 'bug-div-button',
    title: 'O botão que o teclado não alcança',
    technology: 'html',
    difficulty: 'introductory',
    symptom:
      'Quem navega com o teclado (Tab) pula o botão Salvar, e leitores de tela o anunciam como texto comum.',
    problematicCode: {
      language: 'html',
      code: `<div class="botao" id="salvar">Salvar</div>

<script>
  document.querySelector('#salvar').addEventListener('click', salvar);
</script>`,
    },
    reproduction: [
      'Abra a página e pressione Tab repetidamente: o foco nunca chega ao "botão".',
      'Use um leitor de tela (ou a aba Accessibility do DevTools): o elemento aparece como texto genérico.',
    ],
    investigation: [
      'No DevTools, aba Elements → Accessibility, veja o role e se o elemento é focável.',
      'Liste o que um botão de verdade faz: foco, Enter, Espaço, anúncio como botão, estado desabilitado.',
    ],
    diagnosisExerciseId: 'bug-div-button-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'Uma <div> não é um controle: não entra na ordem de foco, não responde a Enter nem a Espaço e não tem papel de botão para tecnologias assistivas. O clique funciona com mouse, então o problema passa despercebido por quem só testa com mouse.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'html',
        code: `<button type="button" class="botao" id="salvar">Salvar</button>`,
      },
      {
        type: 'paragraph',
        text: 'O CSS da classe .botao continua funcionando. Se necessário, remova o estilo padrão do botão, mas mantenha um foco visível.',
      },
    ],
    prevention: [
      'Ação → <button>; navegação → <a href>. Só recorra a ARIA quando não existir elemento nativo.',
      'Teste toda tela apenas com o teclado ao menos uma vez.',
      'Regras de lint de acessibilidade (como as de template do angular-eslint usadas nesta plataforma) apontam cliques sem suporte a teclado.',
    ],
    conceptIds: ['a11y-interactive-elements'],
  },
  {
    id: 'bug-route-input-undefined',
    title: 'A busca quebra quando o filtro sai da URL',
    technology: 'angular',
    difficulty: 'intermediate',
    symptom:
      'A tela de produtos abre normalmente com /produtos?busca=cafe. Ao limpar o campo de busca (ou abrir /produtos sem parâmetro), a lista some e o console mostra "Cannot read properties of undefined (reading \'toLowerCase\')".',
    problematicCode: {
      language: 'typescript',
      code: `// provideRouter(rotas, withComponentInputBinding())
export class ListaProdutos {
  readonly busca = input(''); // o padrão parece garantir uma string

  readonly filtrados = computed(() =>
    PRODUTOS.filter((p) => p.nome.toLowerCase().includes(this.busca().toLowerCase())),
  );
}`,
    },
    reproduction: [
      'Abra /produtos?busca=cafe: funciona.',
      'Abra /produtos, sem o parâmetro: o erro aparece.',
    ],
    investigation: [
      'Mostre o valor no template com {{ busca() | json }} e compare as duas URLs.',
      'Leia na documentação do Router o que withComponentInputBinding faz com parâmetros ausentes.',
    ],
    diagnosisExerciseId: 'bug-route-input-undefined-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'Com withComponentInputBinding, o Router controla os inputs ligados à rota: quando o parâmetro não existe, ele define o input como undefined, e o valor padrão de input("") é ignorado. Medido nesta versão do Angular, tanto ao abrir a rota sem o parâmetro quanto ao removê-lo de uma rota já aberta. O tipo string do input não reflete o que acontece em execução.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'typescript',
        code: `readonly busca = input<string | undefined>(); // o tipo diz a verdade
readonly termo = computed(() => this.busca() ?? '');

readonly filtrados = computed(() =>
  PRODUTOS.filter((p) => p.nome.toLowerCase().includes(this.termo().toLowerCase())),
);`,
      },
    ],
    prevention: [
      'Inputs ligados à rota: declare como opcionais (string | undefined) e normalize num computed.',
      'Teste a rota com e sem cada parâmetro (RouterTestingHarness), não só com a URL completa.',
    ],
    conceptIds: ['angular-routing', 'arch-state'],
  },
  {
    id: 'bug-number-cep',
    title: 'O CEP que chega vazio ou sem o zero',
    technology: 'html',
    difficulty: 'introductory',
    symptom:
      'Alguns pedidos chegam com o CEP vazio; outros com um CEP de sete dígitos, como 1310100, que não existe.',
    problematicCode: {
      language: 'html',
      code: `<label for="cep">CEP</label>
<input id="cep" type="number" required />

<script>
  formulario.addEventListener('submit', () => {
    enviar({ cep: document.querySelector('#cep').valueAsNumber });
  });
</script>`,
    },
    reproduction: [
      'Digite 01310-100 e leia campo.value no console: vem vazio.',
      'Digite 01310100 e leia campo.valueAsNumber: vem 1310100.',
    ],
    investigation: [
      'No console, confira campo.validity.badInput depois de digitar com hífen.',
      'Pergunte: este dado é uma quantidade, que se soma e compara, ou um código?',
    ],
    diagnosisExerciseId: 'bug-number-cep-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'type="number" é para quantidades. Um texto que não é número (como "01310-100") deixa o value vazio e marca badInput; e como número, 01310100 é 1310100, sem o zero à esquerda. Medido no Chromium e no jsdom.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'html',
        code: `<input id="cep" name="cep" inputmode="numeric" autocomplete="postal-code"
       pattern="\\d{5}-?\\d{3}" required />`,
      },
      {
        type: 'paragraph',
        text: 'O valor continua sendo texto (campo.value), o celular mostra o teclado numérico e o pattern valida o formato. Normalize no código (remova o hífen) e valide de novo no servidor.',
      },
    ],
    prevention: [
      'Códigos numéricos (CEP, cartão, documento, telefone) são texto: inputmode="numeric" ou type="tel", nunca type="number".',
      'Teste formulários com zeros à esquerda e com os separadores que as pessoas realmente digitam.',
    ],
    conceptIds: ['html-forms'],
  },
  {
    id: 'bug-track-index-state',
    title: 'A anotação que muda de linha',
    technology: 'angular',
    difficulty: 'intermediate',
    symptom:
      'Numa lista de tarefas com um campo de anotação em cada linha, a pessoa escreve na tarefa A, ordena por prazo, e a anotação aparece na tarefa C.',
    problematicCode: {
      language: 'html',
      code: `@for (t of tarefasOrdenadas(); track $index) {
  <li>
    {{ t.titulo }}
    <input aria-label="Anotação" />
  </li>
}`,
    },
    reproduction: [
      'Digite algo no campo da primeira tarefa.',
      'Mude a ordenação (ou inverta a lista).',
      'Veja em qual linha o texto ficou.',
    ],
    investigation: [
      'No DevTools, aba Elements, observe os elementos <li> enquanto ordena: eles se movem ou só o texto muda?',
      'Leia a expressão de track do @for: o que identifica cada linha?',
    ],
    diagnosisExerciseId: 'bug-track-index-state-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'track $index diz ao Angular que a linha 0 é sempre "a mesma", seja qual for o item. Ao ordenar, ele mantém os elementos (com o texto digitado, que não está em nenhum binding) nas posições e só troca os títulos. Medido com o Angular deste projeto: invertendo três itens, o texto digitado no A foi parar na linha do C.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'html',
        code: `@for (t of tarefasOrdenadas(); track t.id) {
  <li>
    {{ t.titulo }}
    <input aria-label="Anotação" />
  </li>
}`,
      },
      {
        type: 'paragraph',
        text: 'Com track pela identidade do dado, o elemento acompanha o item. Melhor ainda: guarde a anotação no estado (um campo do item ou um mapa por id), para ela também sobreviver a recargas.',
      },
    ],
    prevention: [
      'track pelo id do dado; $index só em listas que nunca reordenam nem inserem no meio.',
      'Estado que importa mora nos dados, não só no DOM.',
    ],
    conceptIds: ['perf-rendering', 'angular-control-flow'],
  },
  {
    id: 'bug-float-money',
    title: 'O total de R$ 59,699999999999996',
    technology: 'javascript',
    difficulty: 'introductory',
    symptom:
      'O carrinho com três unidades de um produto de R$ 19,90 mostra o total R$ 59,699999999999996, e um desconto calculado em cima dele às vezes sai com um centavo de diferença.',
    problematicCode: {
      language: 'javascript',
      code: `const preco = 19.9;
const total = preco * 3;
document.querySelector('#total').textContent = 'R$ ' + total;`,
    },
    reproduction: ['Rode 19.9 * 3 no console.', 'Rode 0.1 + 0.2 no console.'],
    investigation: [
      'Confira se os valores intermediários já têm casas a mais antes de formatar.',
      'Procure onde o preço entra no código: em reais (decimal) ou em centavos (inteiro)?',
    ],
    diagnosisExerciseId: 'bug-float-money-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'Números em JavaScript são ponto flutuante binário: 19,9 não tem representação exata, e a multiplicação expõe o erro. Executado nos testes da plataforma: 19.9 * 3 é 59.699999999999996, enquanto (1990 * 3) / 100 é 59.7.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'javascript',
        code: `const precoCentavos = 1990;
const totalCentavos = precoCentavos * 3; // 5970, exato
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
document.querySelector('#total').textContent = brl.format(totalCentavos / 100);`,
      },
    ],
    prevention: [
      'Guarde e calcule dinheiro em centavos (inteiros); divida só para exibir.',
      'Formate com Intl.NumberFormat, nunca concatenando "R$ ".',
    ],
    conceptIds: ['js-numbers'],
  },
  {
    id: 'bug-container-no-type',
    title: 'A container query que nunca se aplica',
    technology: 'css',
    difficulty: 'intermediate',
    symptom:
      'O cartão deveria ficar em linha nas áreas largas, mas continua empilhado em qualquer lugar, mesmo numa coluna de 640px.',
    problematicCode: {
      language: 'css',
      code: `.card {
  display: block;
}

@container (min-width: 480px) {
  .card {
    display: flex;
  }
}`,
    },
    reproduction: [
      'Coloque o cartão numa área de 640px.',
      'No DevTools, veja o display calculado do .card.',
    ],
    investigation: [
      'Selecione os ancestrais do cartão no painel Elements: algum mostra o selo "container"?',
      'No painel Styles, a regra dentro de @container aparece riscada ou nem aparece?',
    ],
    diagnosisExerciseId: 'bug-container-no-type-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: '@container consulta o ancestral mais próximo declarado como contêiner. Sem container-type em nenhum ancestral, não há contêiner para consultar, e a regra nunca se aplica. Medido no Chromium: num pai de 640px sem container-type, o cartão ficou em bloco; com container-type: inline-size, virou flex.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'css',
        code: `.area-do-cartao {
  container-type: inline-size;
}`,
      },
    ],
    prevention: [
      'Declare container-type no elemento cujo espaço define o layout do componente.',
      'Teste o componente em contêineres de larguras diferentes, não só redimensionando a janela.',
    ],
    conceptIds: ['css-container-queries'],
  },
  {
    id: 'bug-late-assertion',
    title: 'O teste que passa e culpa outro',
    technology: 'javascript',
    difficulty: 'intermediate',
    symptom:
      'Todos os testes de um arquivo aparecem como aprovados, mas a suíte termina com "unhandled error", atribuído a um teste que não tem nada a ver com o problema.',
    problematicCode: {
      language: 'javascript',
      code: `it('mostra o aviso depois de 1 s', () => {
  mostrarAvisoComAtraso('Salvo!', 1000);
  setTimeout(() => {
    expect(document.body.textContent).toContain('Salvo!');
  }, 1000);
});`,
    },
    reproduction: [
      'Rode a suíte inteira e leia a seção de erros não tratados no fim.',
      'Rode só este teste: ele passa sozinho, sem conferir nada.',
    ],
    investigation: [
      'Procure asserções dentro de setTimeout, then ou callbacks que o teste não espera.',
      'Leia o nome do teste ao qual o erro foi atribuído: ele estava rodando quando a asserção atrasada aconteceu.',
    ],
    diagnosisExerciseId: 'bug-late-assertion-diagnosis',
    rootCause: [
      {
        type: 'paragraph',
        text: 'O teste termina quando a função termina; o setTimeout agenda a asserção para depois. Medido com o Vitest deste projeto: o teste passou, e a falha apareceu como erro não tratado atribuído ao teste que estava rodando naquele momento.',
      },
    ],
    fix: [
      {
        type: 'code',
        language: 'javascript',
        code: `it('mostra o aviso depois de 1 s', () => {
  vi.useFakeTimers();
  mostrarAvisoComAtraso('Salvo!', 1000);
  vi.advanceTimersByTime(1000);
  expect(document.body.textContent).toContain('Salvo!');
  vi.useRealTimers();
});`,
      },
    ],
    prevention: [
      'Nenhuma asserção dentro de callbacks que o teste não espera.',
      'Tempo em testes: timers falsos. Promises: await.',
    ],
    conceptIds: ['testing-async'],
  },
];
