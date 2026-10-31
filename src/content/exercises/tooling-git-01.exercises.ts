import { Exercise } from '../../app/core/models/content.models';

export const TOOLING_GIT_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-semver',
    kind: 'code',
    language: 'javascript',
    title: 'Calcule a próxima versão',
    difficulty: 'intermediate',
    conceptIds: ['tooling-versioning'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva proximaVersao(atual, mensagens): recebe a versão atual ("MAIOR.MENOR.CORREÇÃO") e as mensagens dos commits desde ela, no padrão Conventional Commits, e devolve a próxima versão segundo o SemVer.',
      },
    ],
    requirements: [
      'Mudança incompatível: o tipo termina com "!" (como "feat!:" ou "refactor(carrinho)!:") ou alguma linha da mensagem começa com "BREAKING CHANGE:". Sobe a MAIOR e zera as outras.',
      'Senão, se houver algum feat (com ou sem escopo, como "feat(busca):"), sobe a MENOR e zera a CORREÇÃO.',
      'Senão, se houver algum fix, sobe a CORREÇÃO.',
      'Senão (só docs, chore, refactor, test...), a versão não muda.',
      'O tipo precisa ser exato: "feature:" ou "fixed:" não contam.',
    ],
    examples: [
      { input: "proximaVersao('1.4.2', ['fix: corrige busca'])", output: "'1.4.3'" },
      {
        input: "proximaVersao('1.4.2', ['feat(carrinho): cupom', 'fix: busca'])",
        output: "'1.5.0'",
      },
      { input: "proximaVersao('1.4.2', ['feat!: novo formato'])", output: "'2.0.0'" },
    ],
    starterCode: `function proximaVersao(atual, mensagens) {
  // Seu código aqui
}

console.log(proximaVersao('1.4.2', ['fix: corrige busca'])); // esperado: 1.4.3
`,
    tests: [
      {
        id: 'fix',
        description: 'fix sobe a correção',
        source: "expect(proximaVersao('1.4.2', ['fix: corrige busca'])).toBe('1.4.3');",
      },
      {
        id: 'feat',
        description: 'feat (com escopo) sobe a menor e zera a correção',
        source:
          "expect(proximaVersao('1.4.2', ['fix: busca', 'feat(carrinho): cupom'])).toBe('1.5.0');",
      },
      {
        id: 'bang',
        description: '! depois do tipo sobe a maior',
        source:
          "expect(proximaVersao('1.4.2', ['feat!: novo formato'])).toBe('2.0.0'); expect(proximaVersao('1.4.2', ['refactor(carrinho)!: itens em centavos'])).toBe('2.0.0');",
      },
      {
        id: 'footer',
        description: 'Rodapé BREAKING CHANGE: sobe a maior',
        source:
          "expect(proximaVersao('1.4.2', ['refactor: itens\\n\\nBREAKING CHANGE: preco agora em centavos'])).toBe('2.0.0');",
      },
      {
        id: 'none',
        description: 'Só docs, chore e test não mudam a versão',
        source:
          "expect(proximaVersao('1.4.2', ['docs: readme', 'chore: deps', 'test: busca'])).toBe('1.4.2');",
      },
      {
        id: 'exact-type',
        description: '"feature:" e "fixed:" não contam',
        source: "expect(proximaVersao('1.4.2', ['feature: algo', 'fixed: algo'])).toBe('1.4.2');",
      },
      {
        id: 'numbers',
        description: 'Trata as partes como números: 1.9.9 com feat vira 1.10.0',
        source: "expect(proximaVersao('1.9.9', ['feat: algo'])).toBe('1.10.0');",
      },
    ],
    hints: [
      'Uma expressão regular para o início da mensagem: /^(\\w+)(\\([^)]*\\))?(!)?:/ captura o tipo, o escopo e o !.',
      'Para o rodapé, procure uma linha que comece com "BREAKING CHANGE:" (a flag m faz ^ valer para cada linha).',
      'Converta as partes com Number e monte a string de novo no fim.',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function proximaVersao(atual, mensagens) {
  const [maior, menor, correcao] = atual.split('.').map(Number);
  const cabecalho = /^(\\w+)(\\([^)]*\\))?(!)?:/;

  const tipos = mensagens.map((m) => {
    const encontrado = cabecalho.exec(m);
    const quebra = /^BREAKING CHANGE:/m.test(m) || encontrado?.[3] === '!';
    return quebra ? 'quebra' : encontrado?.[1];
  });

  if (tipos.includes('quebra')) return \`\${maior + 1}.0.0\`;
  if (tipos.includes('feat')) return \`\${maior}.\${menor + 1}.0\`;
  if (tipos.includes('fix')) return \`\${maior}.\${menor}.\${correcao + 1}\`;
  return atual;
}`,
      },
      {
        type: 'paragraph',
        text: 'A expressão regular exige o tipo seguido de escopo opcional, ! opcional e dois-pontos, por isso "feature:" não vira feat. Converter as partes para número evita o erro clássico de comparar versões como texto.',
      },
    ],
  },
  {
    id: 'git-01-conflict',
    kind: 'multiple-choice',
    title: 'Resolvendo o conflito',
    difficulty: 'intermediate',
    conceptIds: ['tooling-git'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O merge parou com o conflito da lição: a main mudou a cor para verde e a branch tema-escuro para cinza. Qual é o processo certo?',
      },
    ],
    options: [
      {
        id: 'understand',
        text: 'Entender por que cada lado mudou, decidir o resultado (um dos dois ou uma combinação), apagar os marcadores, rodar os testes, git add e concluir o merge.',
        explanation:
          'Correto. O Git não sabe qual mudança é a certa; só quem entende as duas intenções sabe. Conversar com quem fez a outra mudança costuma ser o passo mais útil.',
      },
      {
        id: 'mine',
        text: 'Ficar sempre com a sua versão, que é a mais recente.',
        explanation:
          'Incorreto. A outra mudança também foi feita por um motivo; descartá-la sem entender perde trabalho.',
      },
      {
        id: 'markers',
        text: 'Fazer commit com os marcadores, para resolver depois.',
        explanation: 'Incorreto. Os marcadores quebram o arquivo (e o build) para todo mundo.',
      },
      {
        id: 'delete',
        text: 'Apagar a branch e refazer a mudança do zero.',
        explanation: 'Incorreto. É trabalho dobrado para um problema de uma linha.',
      },
    ],
    correctOptionIds: ['understand'],
    hints: ['Quem sabe qual cor é a certa?'],
    solution: [
      {
        type: 'code',
        language: 'shell',
        code: `# depois de editar config.txt e rodar os testes
git add config.txt
git commit   # conclui o merge`,
      },
    ],
  },
  {
    id: 'git-01-force',
    kind: 'multiple-choice',
    title: 'O commit da Bia sumiu',
    difficulty: 'intermediate',
    conceptIds: ['tooling-git'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, o commit da Bia sumiu da main depois do git push --force da Ana. O que aconteceu, e o que fazer daqui para frente?',
      },
    ],
    options: [
      {
        id: 'overwrote',
        text: 'O --force substituiu a main remota pela cópia da Ana, que não tinha o commit da Bia. A Bia pode reenviar a partir da cópia local dela; daqui para frente, --force-with-lease (que recusa nesse cenário) e nada de reescrever a main.',
        explanation:
          'Correto. Foi medido num repositório de teste: --force-with-lease foi recusado ("stale info") e --force apagou o commit da outra pessoa. O amend na main compartilhada já era o primeiro erro.',
      },
      {
        id: 'git-bug',
        text: 'Um erro do Git: commits não podem sumir.',
        explanation:
          'Incorreto. Push forçado faz exatamente isso: o remoto passa a ter só o que você enviou.',
      },
      {
        id: 'lost-forever',
        text: 'O commit está perdido para sempre.',
        explanation:
          'Normalmente não: ele continua na cópia local da Bia (e no reflog de quem o tinha), e pode ser enviado de novo.',
      },
      {
        id: 'pull-fix',
        text: 'Basta a Ana rodar git pull, que traz o commit de volta.',
        explanation: 'Incorreto. O remoto já não tem o commit; não há o que puxar.',
      },
    ],
    correctOptionIds: ['overwrote'],
    hints: ['O que --force faz com o que está no remoto?'],
    solution: [
      {
        type: 'code',
        language: 'shell',
        code: `git push --force-with-lease   # recusa se o remoto tem algo que você não viu`,
      },
    ],
  },
  {
    id: 'git-01-revert',
    kind: 'multiple-choice',
    title: 'Desfazendo um commit na main',
    difficulty: 'intermediate',
    conceptIds: ['tooling-git'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Um commit com bug já está na main, e outras pessoas já baixaram. Qual é a forma segura de desfazê-lo?',
      },
    ],
    options: [
      {
        id: 'revert',
        text: 'git revert <commit>: cria um commit novo que desfaz o anterior, sem reescrever o histórico.',
        explanation:
          'Correto. Medido: o revert acrescenta um commit (de 2 para 3) e o arquivo volta ao estado anterior. Quem já baixou recebe a correção normalmente.',
      },
      {
        id: 'reset',
        text: 'git reset --hard HEAD~1 e git push --force.',
        explanation:
          'Incorreto. Reescreve a main compartilhada: quem já baixou fica com um histórico divergente, e commits de outras pessoas podem sumir.',
      },
      {
        id: 'amend',
        text: 'git commit --amend com a correção.',
        explanation:
          'Incorreto. amend troca o commit (o hash muda), o que também reescreve o histórico já compartilhado.',
      },
      {
        id: 'delete-repo',
        text: 'Apagar o repositório remoto e enviar de novo.',
        explanation: 'Incorreto. Perde histórico, pull requests e configurações.',
      },
    ],
    correctOptionIds: ['revert'],
    hints: ['Qual comando acrescenta em vez de reescrever?'],
    solution: [{ type: 'code', language: 'shell', code: `git revert a1b2c3d` }],
  },
  {
    id: 'git-01-version',
    kind: 'predict-output',
    title: 'Qual é a próxima versão?',
    difficulty: 'intermediate',
    conceptIds: ['tooling-versioning'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A versão atual é 1.9.9. Desde ela, entraram estes commits. Qual é a próxima versão, segundo SemVer e Conventional Commits?',
      },
    ],
    language: 'text',
    code: `feat(busca): filtro por categoria
fix(carrinho): arredondamento do desconto
docs: atualiza o README`,
    acceptedAnswers: ['1.10.0'],
    explanation:
      'Há um feat e nenhuma mudança incompatível: sobe a MENOR e zera a CORREÇÃO. 9 + 1 = 10, e cada parte é um número, então 1.10.0.',
    commonMistakes: [
      {
        answer: '2.0.0',
        explanation:
          'Nenhum commit é incompatível (sem ! nem BREAKING CHANGE). A MENOR não "transborda" para a MAIOR.',
      },
      {
        answer: '1.9.10',
        explanation: 'O feat pesa mais que o fix: sobe a MENOR, não a CORREÇÃO.',
      },
      { answer: '1.10.9', explanation: 'Quando a MENOR sobe, a CORREÇÃO volta a zero.' },
    ],
    wrongAnswerGuidance:
      'Não é isso. Encontre o commit de maior impacto e aplique a regra do SemVer para ele.',
    hints: [
      'Qual é o tipo de commit de maior impacto na lista?',
      'Cada parte da versão é um número inteiro, sem limite em 9.',
    ],
    solution: [{ type: 'paragraph', text: 'Próxima versão: 1.10.0.' }],
  },
  {
    id: 'git-01-pr',
    kind: 'multiple-choice',
    title: 'Um bom pull request',
    difficulty: 'intermediate',
    conceptIds: ['tooling-git'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual destes pull requests é o mais fácil de revisar com qualidade?',
      },
    ],
    options: [
      {
        id: 'small',
        text: 'Um que adiciona o filtro por categoria: 6 arquivos, descrição com o que muda, por quê e como testar, testes novos e a integração contínua verde.',
        explanation:
          'Correto. Pequeno, com um assunto só e com contexto: quem revisa entende a intenção e consegue verificar.',
      },
      {
        id: 'giant',
        text: 'Um com o filtro, uma refatoração do carrinho e a atualização de todas as dependências, 80 arquivos, descrição "melhorias".',
        explanation:
          'Incorreto. Vários assuntos misturados escondem problemas; revisões grandes tendem a virar "aprovado" sem leitura.',
      },
      {
        id: 'no-desc',
        text: 'Um pequeno, mas sem descrição: o código fala por si.',
        explanation:
          'Incompleto. O código mostra o que muda; o porquê e como testar precisam estar escritos.',
      },
      {
        id: 'red-ci',
        text: 'Um pequeno e bem descrito, com a integração contínua vermelha "por um teste instável".',
        explanation:
          'Incorreto. Revisar antes de a verificação passar desperdiça tempo; o teste instável precisa ser corrigido.',
      },
    ],
    correctOptionIds: ['small'],
    hints: ['O que ajuda quem revisa a entender e verificar?'],
    solution: [
      {
        type: 'list',
        ordered: false,
        items: [
          'Um assunto',
          'Pequeno',
          'Descrição: o quê, por quê, como testar',
          'Testes',
          'Integração contínua verde',
        ],
      },
    ],
  },
];
