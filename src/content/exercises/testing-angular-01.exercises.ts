import { Exercise } from '../../app/core/models/content.models';

export const TESTING_ANGULAR_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'ng-test-01-query',
    kind: 'multiple-choice',
    title: 'Como encontrar o botão?',
    difficulty: 'intermediate',
    conceptIds: ['testing-angular'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O teste precisa clicar no botão "Tentar de novo". Qual forma de encontrá-lo resiste melhor a refatorações que não mudam a tela?',
      },
    ],
    options: [
      {
        id: 'text',
        text: 'Procurar entre os <button> aquele cujo texto é "Tentar de novo".',
        explanation:
          'Correto. É assim que a pessoa encontra o botão. Mudanças de classe, de ordem ou de estrutura interna não afetam o teste; mudar o texto visível afeta, e isso é uma mudança real que merece atenção.',
      },
      {
        id: 'class-index',
        text: "tela.querySelectorAll('.btn')[2]",
        explanation:
          'Incorreto. Quebra se alguém mudar a classe ou acrescentar um botão antes, sem que nada mude para a pessoa.',
      },
      {
        id: 'private',
        text: 'Chamar direto o método produtos.reload() do componente.',
        explanation:
          'Incorreto. O teste deixa de verificar se o botão existe, está visível e chama o método. Um botão quebrado passaria.',
      },
      {
        id: 'xpath',
        text: 'Um seletor que descreve o caminho: main > section > div:nth-child(2) > button.',
        explanation: 'Incorreto. Qualquer mudança de estrutura quebra o teste.',
      },
    ],
    correctOptionIds: ['text'],
    hints: ['Como a pessoa que usa a tela encontra o botão?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `const botao = Array.from(tela.querySelectorAll('button')).find(
  (b) => b.textContent?.trim() === 'Tentar de novo',
)!;
botao.click();`,
      },
    ],
  },
  {
    id: 'ng-test-01-verify',
    kind: 'multiple-choice',
    title: 'Para que serve verify()?',
    difficulty: 'intermediate',
    conceptIds: ['testing-angular'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Os testes da busca chamam servidor.verify() no afterEach. O que isso detecta?',
      },
    ],
    options: [
      {
        id: 'open-requests',
        text: 'Requisições que o componente fez e o teste não esperou com expectOne nem respondeu, como uma chamada duplicada ou inesperada.',
        explanation:
          'Correto. verify falha se sobrar requisição aberta. Sem ele, um componente que faz duas chamadas onde deveria fazer uma passaria nos testes.',
      },
      {
        id: 'network',
        text: 'Se o servidor real está no ar.',
        explanation:
          'Incorreto. Nos testes não há servidor real: HttpTestingController o substitui.',
      },
      {
        id: 'types',
        text: 'Se a resposta tem o formato do tipo Produto.',
        explanation:
          'Incorreto. A resposta é o que o teste mandou com flush; verify não olha o conteúdo.',
      },
      {
        id: 'coverage',
        text: 'Se todos os métodos do service foram chamados.',
        explanation: 'Incorreto. verify só olha requisições abertas.',
      },
    ],
    correctOptionIds: ['open-requests'],
    hints: ['O que acontece com uma requisição que ninguém respondeu?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `afterEach(() => servidor.verify());`,
      },
    ],
  },
  {
    id: 'ng-test-01-whenstable',
    kind: 'multiple-choice',
    title: 'Por que o teste não termina?',
    difficulty: 'intermediate',
    conceptIds: ['testing-angular'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, o teste para em await fixture.whenStable() até estourar o tempo limite. Por quê?',
      },
    ],
    options: [
      {
        id: 'pending',
        text: 'whenStable espera as tarefas pendentes, inclusive a requisição. Ela só termina quando o teste responde com flush, que está depois. Responda primeiro e espere depois.',
        explanation:
          'Correto. O teste espera algo que só ele mesmo pode resolver. Se precisar ver a tela durante o carregamento, use fixture.detectChanges(), que atualiza sem esperar.',
      },
      {
        id: 'slow',
        text: 'O componente é lento; basta aumentar o tempo limite.',
        explanation: 'Incorreto. Ele esperaria para sempre: ninguém responde a requisição.',
      },
      {
        id: 'missing-tick',
        text: 'Faltou mais um TestBed.tick().',
        explanation:
          'Incorreto. O tick já disparou a requisição; o problema é esperar a resposta antes de dá-la.',
      },
      {
        id: 'zone',
        text: 'Falta importar zone.js nos testes.',
        explanation:
          'Incorreto. Aplicações atuais funcionam sem zone.js; o travamento é de ordem, não de configuração.',
      },
    ],
    correctOptionIds: ['pending'],
    hints: ['Quem resolve a requisição pendente no teste?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `servidor.expectOne((req) => req.url === '/api/produtos').flush([]);
await fixture.whenStable(); // agora não há nada pendente`,
      },
    ],
  },
  {
    id: 'ng-test-01-fake',
    kind: 'multiple-choice',
    title: 'Testar o resumo do carrinho',
    difficulty: 'intermediate',
    conceptIds: ['testing-angular'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Você quer testar que o ResumoCarrinho (lição de services) mostra a quantidade e o total. Qual abordagem é a mais adequada para esse teste de componente?',
      },
    ],
    options: [
      {
        id: 'fake',
        text: 'Fornecer um CarrinhoService falso com { provide: CarrinhoService, useValue: { quantidade: () => 3, total: () => 25 } } e conferir o texto na tela.',
        explanation:
          'Correto. O teste controla os dados e verifica só o que é do componente: mostrar. As regras do carrinho são testadas no teste do próprio service.',
      },
      {
        id: 'real-backend',
        text: 'Subir o backend real e adicionar itens por ele.',
        explanation:
          'Incorreto para um teste de componente: fica lento, depende de rede e quebra por motivos que não são do componente. Isso é papel de um teste ponta a ponta.',
      },
      {
        id: 'private-signal',
        text: 'Alterar o signal privado _itens do service real pelo console do teste.',
        explanation: 'Incorreto. O teste passa a depender de um detalhe interno do service.',
      },
      {
        id: 'snapshot',
        text: 'Comparar o HTML inteiro do componente com uma cópia salva.',
        explanation:
          'Frágil: qualquer mudança de marcação quebra o teste, e é fácil aceitar uma cópia nova sem olhar.',
      },
    ],
    correctOptionIds: ['fake'],
    hints: ['O que é responsabilidade do componente e o que é do service?'],
    solution: [
      {
        type: 'code',
        language: 'typescript',
        code: `TestBed.overrideProvider(CarrinhoService, {
  useValue: { quantidade: () => 3, total: () => 25 },
});`,
      },
    ],
  },
  {
    id: 'ng-test-01-e2e',
    kind: 'multiple-choice',
    title: 'O que merece um teste ponta a ponta?',
    difficulty: 'intermediate',
    conceptIds: ['testing-strategy'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual destes casos é o melhor candidato a um teste ponta a ponta?',
      },
    ],
    options: [
      {
        id: 'checkout',
        text: 'Uma pessoa entra, adiciona um produto ao carrinho e finaliza a compra.',
        explanation:
          'Correto. É um fluxo crítico que atravessa várias telas, rotas, o backend e o navegador real. Se quebrar, a empresa para de vender.',
      },
      {
        id: 'split',
        text: 'dividirConta com dez combinações de total e pessoas.',
        explanation: 'Incorreto. Lógica pura é teste unitário: milissegundos, sem navegador.',
      },
      {
        id: 'message',
        text: 'A mensagem de e-mail inválido no cadastro.',
        explanation:
          'Incorreto. Um teste de componente verifica isso mais rápido e de forma estável.',
      },
      {
        id: 'css',
        text: 'A cor de cada botão em todos os estados.',
        explanation:
          'Incorreto. Testes de comparação visual ou revisão de design cobrem isso melhor; ponta a ponta é para fluxos.',
      },
    ],
    correctOptionIds: ['checkout'],
    hints: ['Ponta a ponta é para fluxos inteiros e críticos.'],
    solution: [
      {
        type: 'paragraph',
        text: 'Poucos testes ponta a ponta, para os fluxos que não podem quebrar.',
      },
    ],
  },
  {
    id: 'ng-test-01-ci',
    kind: 'order-steps',
    title: 'A ordem da integração contínua',
    difficulty: 'intermediate',
    conceptIds: ['testing-strategy'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Ordene as etapas do fluxo de integração contínua da lição, do início ao fim.',
      },
    ],
    items: [
      {
        id: 'checkout',
        text: 'Baixar o código da mudança (checkout)',
        why: 'Sem o código não há o que verificar.',
      },
      {
        id: 'install',
        text: 'Instalar as dependências exatas do lockfile (npm ci)',
        why: 'Lint, testes e build dependem dos pacotes instalados, nas versões travadas no package-lock.json.',
      },
      {
        id: 'lint',
        text: 'Rodar o lint',
        why: 'É a verificação mais rápida: falha cedo em problemas simples.',
      },
      {
        id: 'test',
        text: 'Rodar os testes',
        why: 'Verifica o comportamento depois que o código passou nas regras estáticas.',
      },
      {
        id: 'build',
        text: 'Gerar o build de produção',
        why: 'Confirma que a aplicação compila do jeito que vai ao ar; é a etapa mais lenta.',
      },
    ],
    explanation:
      'Das verificações mais rápidas para as mais lentas, para que um erro simples apareça em segundos. Qualquer etapa vermelha impede a mudança de entrar.',
    hints: ['O que precisa existir antes de rodar o lint?'],
    solution: [
      { type: 'list', ordered: true, items: ['checkout', 'npm ci', 'lint', 'testes', 'build'] },
    ],
  },
];
