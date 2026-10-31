import { Exercise } from '../../app/core/models/content.models';

/** Diagnosis challenges of the bug bestiary: answered before the cause is revealed. */
export const BUG_EXERCISES: readonly Exercise[] = [
  {
    id: 'bug-closure-var-loop-diagnosis',
    kind: 'predict-output',
    title: 'O que os três timers imprimem?',
    difficulty: 'introductory',
    conceptIds: ['js-closures'],
    prompt: [{ type: 'paragraph', text: 'Escreva a saída completa no console, na ordem.' }],
    language: 'javascript',
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    acceptedAnswers: ['3 3 3', '333', '3, 3, 3', '3,3,3'],
    explanation:
      'Os callbacks só executam depois que o laço termina, e com var existe uma única variável i para a função inteira. Quando os três callbacks rodam, i já vale 3.',
    commonMistakes: [
      {
        answer: '0 1 2',
        explanation:
          'Isso seria o resultado com let, que cria uma variável nova a cada iteração. Com var, todos os callbacks capturam a mesma variável, e ela já vale 3 quando eles executam.',
      },
      {
        answer: '2 2 2',
        explanation:
          'O laço só para quando a condição i < 3 fica falsa, ou seja, quando i chega a 3. Esse é o valor que os callbacks encontram.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Pense em dois pontos: quando os callbacks do setTimeout executam (antes ou depois do laço terminar?) e quantas variáveis i existem com var.',
    hints: [
      'setTimeout com 0 não executa na hora: o callback vai para a fila e espera o código atual terminar.',
      'var tem escopo de função, não de bloco.',
    ],
    solution: [{ type: 'paragraph', text: 'Imprime 3, três vezes (uma por linha).' }],
  },
  {
    id: 'bug-undefined-property-diagnosis',
    kind: 'multiple-choice',
    title: 'Quem é undefined?',
    difficulty: 'introductory',
    conceptIds: ['js-null-undefined'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A chamada cidadeDoUsuario({ nome: "Ana" }) lança "TypeError: Cannot read properties of undefined (reading \'cidade\')". Qual valor é undefined?',
      },
    ],
    options: [
      {
        id: 'endereco',
        text: 'usuario.endereco',
        explanation:
          'Correto. A mensagem diz que o código tentou ler cidade de algo undefined. A expressão antes de .cidade é usuario.endereco, e o objeto { nome: "Ana" } não tem endereco.',
      },
      {
        id: 'usuario',
        text: 'usuario',
        explanation:
          'Incorreto. usuario é o objeto { nome: "Ana" }. Se ele fosse undefined, a mensagem diria "reading \'endereco\'", a primeira propriedade lida.',
      },
      {
        id: 'cidade',
        text: 'usuario.endereco.cidade',
        explanation:
          'Incorreto. A leitura de cidade nem chegou a acontecer: "reading \'cidade\'" é a propriedade que o código tentava ler, não a que é undefined.',
      },
      {
        id: 'to-upper',
        text: 'toUpperCase',
        explanation:
          'Incorreto. Nesse caso a mensagem seria outra: "toUpperCase is not a function" ou "reading \'toUpperCase\'".',
      },
    ],
    correctOptionIds: ['endereco'],
    hints: [
      'A mensagem diz qual propriedade estava sendo lida, e não qual valor era undefined.',
      'Olhe o que vem imediatamente antes de .cidade na expressão.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'usuario.endereco é undefined. Ler qualquer propriedade de undefined lança TypeError, e a mensagem cita a propriedade que estava sendo lida (cidade).',
      },
    ],
  },
  {
    id: 'bug-sort-mutation-diagnosis',
    kind: 'predict-output',
    title: 'O que aconteceu com o array original?',
    difficulty: 'introductory',
    conceptIds: ['js-mutability'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Quais valores notas contém no fim? Digite-os na ordem, separados por vírgula.',
      },
    ],
    language: 'javascript',
    code: `const notas = [7, 10, 3];
const ordenadas = notas.sort((a, b) => b - a);
console.log(notas);`,
    acceptedAnswers: ['10, 7, 3', '10,7,3', '[10, 7, 3]', '[10,7,3]', '10 7 3'],
    explanation:
      'sort ordena o próprio array (in place) e devolve a mesma referência. ordenadas e notas são o mesmo array, já ordenado de forma decrescente.',
    commonMistakes: [
      {
        answer: '7, 10, 3',
        explanation:
          'Seria assim se sort devolvesse uma cópia. Ele altera o array original: notas e ordenadas apontam para o mesmo array.',
      },
      {
        answer: '3, 7, 10',
        explanation:
          'A função de comparação b - a ordena do maior para o menor (decrescente). Para crescente, seria a - b.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. Verifique se sort cria um array novo ou altera o que já existe, e qual ordem a função b - a produz.',
    hints: [
      'const impede reatribuir a variável, não alterar o conteúdo do array.',
      'sort altera o array em que é chamado.',
    ],
    solution: [{ type: 'paragraph', text: 'notas termina como [10, 7, 3].' }],
  },
  {
    id: 'bug-async-foreach-diagnosis',
    kind: 'predict-output',
    title: 'Quanto vale o total?',
    difficulty: 'intermediate',
    conceptIds: ['js-async'],
    prompt: [
      {
        type: 'paragraph',
        text: 'buscarPreco devolve uma Promise que resolve com 10 depois de alguns milissegundos. O que o console.log imprime?',
      },
    ],
    language: 'javascript',
    code: `const ids = [1, 2, 3];
let total = 0;

ids.forEach(async (id) => {
  const preco = await buscarPreco(id);
  total += preco;
});

console.log(total);`,
    acceptedAnswers: ['0'],
    explanation:
      'forEach chama a função async três vezes e ignora as Promises que ela devolve. Cada chamada para no await, e o código segue direto para o console.log, que roda antes de qualquer preço chegar.',
    commonMistakes: [
      {
        answer: '30',
        explanation:
          'Seria 30 se o código esperasse as três buscas. forEach não espera Promises: o await pausa só a função de dentro, não o forEach nem o código depois dele.',
      },
      {
        answer: '10',
        explanation:
          'Nenhuma busca terminou quando o console.log roda: todas ainda estão esperando no await.',
      },
    ],
    wrongAnswerGuidance:
      'Não é isso. O await pausa qual função? E o forEach espera a Promise que a função async devolve?',
    hints: [
      'Uma função async devolve uma Promise imediatamente, assim que encontra o primeiro await.',
      'forEach ignora o valor de retorno da função que recebe.',
    ],
    solution: [
      { type: 'paragraph', text: 'Imprime 0: o log roda antes de qualquer await terminar.' },
    ],
  },
  {
    id: 'bug-signal-mutation-diagnosis',
    kind: 'multiple-choice',
    title: 'Por que a lista não atualiza?',
    difficulty: 'intermediate',
    conceptIds: ['angular-signals'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ao clicar em "Adicionar", a nova tarefa não aparece na tela (o componente usa ChangeDetectionStrategy.OnPush, numa aplicação zoneless). Qual é a causa?',
      },
    ],
    options: [
      {
        id: 'same-reference',
        text: 'O array foi alterado no lugar com push: o signal não foi atualizado (set/update nunca foi chamado), então nada que depende dele é notificado.',
        explanation:
          'Correto. Ler tarefas() devolve o array; push altera esse objeto, mas o signal não fica sabendo. Só set e update notificam, e o template continua com a renderização antiga.',
      },
      {
        id: 'no-arrays',
        text: 'Signals não funcionam com arrays, só com valores primitivos.',
        explanation:
          'Incorreto. Signals guardam qualquer valor. O problema é alterar o valor por fora, sem passar por set ou update.',
      },
      {
        id: 'detect-changes',
        text: 'Falta chamar ChangeDetectorRef.detectChanges() depois do push.',
        explanation:
          'Incorreto como correção. Forçar a detecção pode até redesenhar a tela, mas esconde o problema: quem mais depende do signal (computed, effect) continua sem saber da mudança.',
      },
      {
        id: 'track',
        text: 'O track do @for está errado.',
        explanation:
          'Incorreto. track afeta como os itens são reaproveitados, mas o bloco nem chega a ser reavaliado, porque o signal não mudou.',
      },
    ],
    correctOptionIds: ['same-reference'],
    hints: [
      'Quais métodos de um WritableSignal avisam os dependentes de que o valor mudou?',
      'tarefas() devolve o array em si. O que push faz com ele?',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'A mutação não passou pelo signal. A correção é criar um array novo: this.tarefas.update((lista) => [...lista, titulo]).',
      },
    ],
  },
  {
    id: 'bug-div-button-diagnosis',
    kind: 'multiple-choice',
    title: 'Qual é a melhor correção?',
    difficulty: 'introductory',
    conceptIds: ['a11y-interactive-elements'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O "botão" Salvar é uma <div> com um listener de clique. Quem usa teclado não consegue salvar. Qual é a melhor correção?',
      },
    ],
    options: [
      {
        id: 'button',
        text: 'Trocar a <div> por <button type="button">.',
        explanation:
          'Correto. <button> já recebe foco, é ativado com Enter e Espaço, é anunciado como botão por leitores de tela e pode ser desabilitado. Tudo isso sem uma linha extra de código.',
      },
      {
        id: 'tabindex',
        text: 'Adicionar tabindex="0" à <div>.',
        explanation:
          'Incompleto. A <div> passa a receber foco, mas Enter e Espaço continuam sem fazer nada, e o leitor de tela não a anuncia como botão.',
      },
      {
        id: 'role',
        text: 'Adicionar role="button" à <div>.',
        explanation:
          'Incompleto. O leitor de tela passa a anunciar "botão", mas o elemento não recebe foco nem responde ao teclado: a promessa feita pelo role não é cumprida.',
      },
      {
        id: 'aria-label',
        text: 'Adicionar aria-label="Salvar" à <div>.',
        explanation:
          'Incorreto. aria-label muda o nome anunciado, não o comportamento. O texto "Salvar" já era o nome; o problema é que a div não é um controle.',
      },
    ],
    correctOptionIds: ['button'],
    hints: [
      'Liste o que um botão faz: foco, teclas, anúncio, desabilitar. Quantas dessas coisas cada opção resolve?',
      'A primeira regra do ARIA: se existe um elemento nativo com o comportamento, use-o.',
    ],
    solution: [
      {
        type: 'paragraph',
        text: 'Use <button type="button">. Recriar um botão com div + tabindex + role + listeners de teclado é possível, mas é mais código para chegar, com sorte, ao mesmo resultado.',
      },
    ],
  },
  {
    id: 'bug-route-input-undefined-diagnosis',
    kind: 'multiple-choice',
    title: 'Por que busca() é undefined?',
    difficulty: 'intermediate',
    conceptIds: ['angular-routing'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O input foi declarado como input(""). Por que, em /produtos sem parâmetro, busca() devolve undefined?',
      },
    ],
    options: [
      {
        id: 'router-sets-undefined',
        text: 'Com withComponentInputBinding, o Router define o input como undefined quando o parâmetro não existe, e isso substitui o valor padrão.',
        explanation:
          'Correto. Os testes da plataforma medem isso nesta versão do Angular: ao abrir a rota sem o parâmetro e ao removê-lo, o input chega undefined.',
      },
      {
        id: 'default-bug',
        text: 'O valor padrão de input() só vale depois do primeiro ciclo de detecção de mudanças.',
        explanation:
          'Incorreto. Fora de rotas, o padrão vale desde o início; aqui é o Router que sobrescreve.',
      },
      {
        id: 'query-empty',
        text: 'O Router passa a string vazia, e toLowerCase falha nela.',
        explanation: 'Incorreto. "".toLowerCase() funciona; o erro diz que o valor é undefined.',
      },
      {
        id: 'missing-provider',
        text: 'Falta withComponentInputBinding na configuração.',
        explanation:
          'Incorreto: sem ele, o input nunca receberia "cafe" da URL, e a primeira URL também não filtraria.',
      },
    ],
    correctOptionIds: ['router-sets-undefined'],
    hints: ['Quem define o valor desse input: o template pai ou o Router?'],
    solution: [
      {
        type: 'paragraph',
        text: 'O Router é dono dos inputs ligados à rota e escreve undefined quando o parâmetro falta. Tipe como string | undefined e normalize.',
      },
    ],
  },
  {
    id: 'bug-number-cep-diagnosis',
    kind: 'multiple-choice',
    title: 'Para onde foi o CEP?',
    difficulty: 'introductory',
    conceptIds: ['html-forms'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Quem digitou 01310-100 enviou um CEP vazio; quem digitou 01310100 enviou 1310100. Qual é a causa comum?',
      },
    ],
    options: [
      {
        id: 'number-type',
        text: 'type="number" trata o campo como quantidade: com o hífen, o valor não é número e fica vazio; como número, o zero à esquerda não existe.',
        explanation:
          'Correto. Medido no Chromium e no jsdom: value vazio com badInput para "01310-100", e valueAsNumber 1310100 para "01310100".',
      },
      {
        id: 'server',
        text: 'O servidor remove zeros e hífens.',
        explanation:
          'Incorreto. O valor já sai errado do navegador: confira no console antes de enviar.',
      },
      {
        id: 'required',
        text: 'Falta pattern no campo.',
        explanation:
          'pattern não se aplica a type="number"; e o problema é o tipo, não a falta de validação.',
      },
      {
        id: 'mask',
        text: 'Falta uma máscara de digitação.',
        explanation: 'Uma máscara não muda o fato de que o campo guarda um número.',
      },
    ],
    correctOptionIds: ['number-type'],
    hints: ['CEP é uma quantidade?'],
    solution: [{ type: 'paragraph', text: 'Códigos são texto: inputmode="numeric" com pattern.' }],
  },
  {
    id: 'bug-track-index-state-diagnosis',
    kind: 'multiple-choice',
    title: 'Por que a anotação muda de linha?',
    difficulty: 'intermediate',
    conceptIds: ['perf-rendering'],
    prompt: [{ type: 'paragraph', text: 'Qual é a causa?' }],
    options: [
      {
        id: 'index',
        text: 'track $index liga cada elemento à posição: ao ordenar, os elementos ficam no lugar com o texto digitado, e só os títulos mudam.',
        explanation:
          'Correto. Medido: com track $index, o texto digitado no item A apareceu na linha do C depois de inverter a lista; com track t.id, ficou com o A.',
      },
      {
        id: 'sort',
        text: 'A função de ordenação embaralha os campos de texto.',
        explanation:
          'A ordenação mexe nos dados; quem decide o que fazer com os elementos é o @for, pelo track.',
      },
      {
        id: 'zone',
        text: 'Falta detecção de mudanças depois de ordenar.',
        explanation:
          'A tela foi atualizada (os títulos mudaram); o problema é o que foi reaproveitado.',
      },
      {
        id: 'browser',
        text: 'O navegador guarda o texto pelo aria-label do campo.',
        explanation: 'Incorreto. O texto está no elemento, que o Angular manteve na mesma posição.',
      },
    ],
    correctOptionIds: ['index'],
    hints: ['O que identifica cada linha para o @for?'],
    solution: [{ type: 'paragraph', text: 'track pelo id do dado.' }],
  },
  {
    id: 'bug-float-money-diagnosis',
    kind: 'predict-output',
    title: 'Quanto dá 19.9 * 3?',
    difficulty: 'introductory',
    conceptIds: ['js-numbers'],
    prompt: [{ type: 'paragraph', text: 'Digite exatamente o valor que o console mostra.' }],
    language: 'javascript',
    code: `console.log(19.9 * 3);`,
    acceptedAnswers: ['59.699999999999996'],
    explanation:
      '19,9 não tem representação exata em binário, e a multiplicação expõe o erro: 59.699999999999996. Executado nos testes da plataforma.',
    commonMistakes: [
      {
        answer: '59.7',
        explanation:
          'Seria o resultado exato, mas o ponto flutuante binário não representa 19,9 com exatidão.',
      },
      {
        answer: '59,7',
        explanation: 'O console usa ponto como separador decimal, e o valor não é exato.',
      },
    ],
    wrongAnswerGuidance: 'Não é isso. Lembre que 0.1 + 0.2 não é 0.3 em JavaScript.',
    hints: ['Rode 0.1 + 0.2 no console antes.'],
    solution: [{ type: 'paragraph', text: '59.699999999999996. Por isso, dinheiro em centavos.' }],
  },
  {
    id: 'bug-container-no-type-diagnosis',
    kind: 'multiple-choice',
    title: 'Por que a regra não se aplica?',
    difficulty: 'intermediate',
    conceptIds: ['css-container-queries'],
    prompt: [{ type: 'paragraph', text: 'Qual é a causa?' }],
    options: [
      {
        id: 'container-type',
        text: 'Nenhum ancestral tem container-type, então @container não tem o que consultar.',
        explanation:
          'Correto. Medido no Chromium: sem container-type, o cartão ficou em bloco mesmo com 640px.',
      },
      {
        id: 'specificity',
        text: 'A regra de fora vence por especificidade.',
        explanation:
          'Os seletores são iguais e a regra de dentro vem depois; ela venceria se se aplicasse.',
      },
      {
        id: 'units',
        text: '480px precisa ser escrito em rem.',
        explanation: 'Incorreto. px é válido na condição.',
      },
      {
        id: 'viewport',
        text: 'A tela é pequena demais.',
        explanation: '@container não olha a tela, e sim o contêiner, que aqui nem existe.',
      },
    ],
    correctOptionIds: ['container-type'],
    hints: ['Qual elemento é o contêiner?'],
    solution: [{ type: 'paragraph', text: 'Declare container-type: inline-size no ancestral.' }],
  },
  {
    id: 'bug-late-assertion-diagnosis',
    kind: 'multiple-choice',
    title: 'Por que o erro aparece em outro teste?',
    difficulty: 'intermediate',
    conceptIds: ['testing-async'],
    prompt: [{ type: 'paragraph', text: 'Qual é a causa?' }],
    options: [
      {
        id: 'late',
        text: 'O teste termina antes do setTimeout; a asserção roda depois, quando outro teste está em execução, e a falha é atribuída a ele.',
        explanation:
          'Correto. Medido com o Vitest deste projeto: o teste com a asserção atrasada passou, e o erro foi atribuído a outro teste.',
      },
      {
        id: 'order',
        text: 'Os testes rodam em paralelo dentro do arquivo e misturam os resultados.',
        explanation:
          'Por padrão, os testes de um arquivo rodam em sequência; o problema é o momento da asserção.',
      },
      {
        id: 'vitest-bug',
        text: 'É um bug do Vitest.',
        explanation: 'O Vitest faz o que pode: avisa que houve um erro fora de qualquer teste.',
      },
      {
        id: 'timeout',
        text: 'O teste estourou o tempo limite.',
        explanation: 'Não estourou: terminou cedo demais.',
      },
    ],
    correctOptionIds: ['late'],
    hints: ['Quando o teste termina, e quando a asserção roda?'],
    solution: [
      { type: 'paragraph', text: 'Timers falsos e nenhuma asserção em callback não aguardado.' },
    ],
  },
];
