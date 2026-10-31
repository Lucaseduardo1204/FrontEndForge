import { Exercise } from '../../app/core/models/content.models';

export const TOOLING_LINT_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-lint-report',
    kind: 'code',
    language: 'javascript',
    title: 'O resumo do lint para o CI',
    difficulty: 'intermediate',
    conceptIds: ['tooling-lint'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O ESLint com --format json gera uma lista de arquivos, cada um com messages: [{ ruleId, severity, line }] (severity 2 é erro, 1 é aviso). Escreva resumirLint(relatorio) e deveFalhar(resumo, opcoes).',
      },
    ],
    requirements: [
      'resumirLint devolve { erros, avisos, porRegra, arquivosComErro }.',
      'porRegra é uma lista de { regra, total }, do maior total para o menor; empates em ordem alfabética da regra.',
      'Mensagens sem ruleId (erros de sintaxe) contam como regra "sintaxe".',
      'arquivosComErro lista, na ordem do relatório, os filePath com pelo menos um erro (avisos não contam).',
      'deveFalhar(resumo, { maxAvisos }) é true se houver qualquer erro ou se os avisos passarem de maxAvisos (padrão 0).',
    ],
    examples: [
      {
        input:
          "resumirLint([{ filePath: 'a.ts', messages: [{ ruleId: 'eqeqeq', severity: 2, line: 3 }] }])",
        output:
          "{ erros: 1, avisos: 0, porRegra: [{ regra: 'eqeqeq', total: 1 }], arquivosComErro: ['a.ts'] }",
      },
    ],
    starterCode: `function resumirLint(relatorio) {
  // Seu código aqui
}

function deveFalhar(resumo, opcoes = {}) {
  // Seu código aqui
}

console.log(resumirLint([{ filePath: 'a.ts', messages: [{ ruleId: 'eqeqeq', severity: 2, line: 3 }] }]));
`,
    tests: [
      {
        id: 'counts',
        description: 'Conta erros e avisos',
        source:
          "const r = resumirLint([{ filePath: 'a.ts', messages: [{ ruleId: 'eqeqeq', severity: 2, line: 1 }, { ruleId: 'no-console', severity: 1, line: 2 }] }, { filePath: 'b.ts', messages: [] }]); expect(r.erros).toBe(1); expect(r.avisos).toBe(1);",
      },
      {
        id: 'by-rule',
        description: 'porRegra ordenado por total e, no empate, pelo nome',
        source:
          "const r = resumirLint([{ filePath: 'a.ts', messages: [{ ruleId: 'z-regra', severity: 1, line: 1 }, { ruleId: 'eqeqeq', severity: 2, line: 2 }, { ruleId: 'eqeqeq', severity: 2, line: 3 }, { ruleId: 'a-regra', severity: 2, line: 4 }] }]); expect(r.porRegra).toEqual([{ regra: 'eqeqeq', total: 2 }, { regra: 'a-regra', total: 1 }, { regra: 'z-regra', total: 1 }]);",
      },
      {
        id: 'syntax',
        description: 'Mensagem sem ruleId conta como sintaxe',
        source:
          "const r = resumirLint([{ filePath: 'a.ts', messages: [{ ruleId: null, severity: 2, line: 1 }] }]); expect(r.porRegra).toEqual([{ regra: 'sintaxe', total: 1 }]);",
      },
      {
        id: 'files',
        description: 'arquivosComErro ignora arquivos só com avisos',
        source:
          "const r = resumirLint([{ filePath: 'a.ts', messages: [{ ruleId: 'x', severity: 1, line: 1 }] }, { filePath: 'b.html', messages: [{ ruleId: 'y', severity: 2, line: 1 }] }, { filePath: 'c.ts', messages: [{ ruleId: 'y', severity: 2, line: 9 }] }]); expect(r.arquivosComErro).toEqual(['b.html', 'c.ts']);",
      },
      {
        id: 'empty',
        description: 'Relatório limpo',
        source:
          "expect(resumirLint([{ filePath: 'a.ts', messages: [] }])).toEqual({ erros: 0, avisos: 0, porRegra: [], arquivosComErro: [] });",
      },
      {
        id: 'fail',
        description: 'deveFalhar: qualquer erro, ou avisos acima do limite',
        source:
          'expect(deveFalhar({ erros: 1, avisos: 0 })).toBe(true); expect(deveFalhar({ erros: 0, avisos: 0 })).toBe(false); expect(deveFalhar({ erros: 0, avisos: 3 })).toBe(true); expect(deveFalhar({ erros: 0, avisos: 3 }, { maxAvisos: 5 })).toBe(false); expect(deveFalhar({ erros: 0, avisos: 6 }, { maxAvisos: 5 })).toBe(true);',
      },
    ],
    hints: [
      'Percorra todos os arquivos e mensagens uma vez, contando num Map por regra.',
      'Ordenação: (a, b) => b.total - a.total || a.regra.localeCompare(b.regra).',
      'Padrão do parâmetro: function deveFalhar(resumo, { maxAvisos = 0 } = {}).',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `function resumirLint(relatorio) {
  let erros = 0;
  let avisos = 0;
  const contagem = new Map();
  const arquivosComErro = [];

  for (const arquivo of relatorio) {
    let temErro = false;
    for (const m of arquivo.messages) {
      if (m.severity === 2) {
        erros++;
        temErro = true;
      } else avisos++;
      const regra = m.ruleId ?? 'sintaxe'; // erros de sintaxe não têm regra
      contagem.set(regra, (contagem.get(regra) ?? 0) + 1);
    }
    if (temErro) arquivosComErro.push(arquivo.filePath);
  }

  const porRegra = [...contagem]
    .map(([regra, total]) => ({ regra, total }))
    .sort((a, b) => b.total - a.total || a.regra.localeCompare(b.regra));
  return { erros, avisos, porRegra, arquivosComErro };
}

function deveFalhar(resumo, { maxAvisos = 0 } = {}) {
  return resumo.erros > 0 || resumo.avisos > maxAvisos;
}`,
      },
      {
        type: 'paragraph',
        text: 'Um resumo por regra mostra onde está a dívida (uma regra com 200 ocorrências pede uma correção em massa ou uma decisão), e a lista de arquivos ajuda a distribuir o trabalho. O limite de avisos permite adotar uma regra nova como aviso e ir reduzindo, sem bloquear todo mundo no primeiro dia.',
      },
    ],
  },
  {
    id: 'lint-01-new-rule',
    kind: 'multiple-choice',
    title: 'Ligar a regra nova?',
    difficulty: 'intermediate',
    conceptIds: ['tooling-lint'],
    prompt: [
      {
        type: 'paragraph',
        text: 'A equipe quer proibir any com @typescript-eslint/no-explicit-any como erro. Ao testar, aparecem 340 ocorrências. Qual é o caminho mais sustentável?',
      },
    ],
    options: [
      {
        id: 'gradual',
        text: 'Ligar como aviso, com limite de avisos no CI igual ao número atual, e baixar o limite conforme as correções; virar erro quando chegar a zero.',
        explanation:
          'Correto. Nada novo entra, a dívida cai aos poucos, e ninguém fica bloqueado. Foi a mesma lógica usada neste projeto: as regras extras só viraram erro depois de medir que o código já as seguia.',
      },
      {
        id: 'error-now',
        text: 'Ligar como erro hoje e bloquear o CI até corrigir tudo.',
        explanation: 'Paralisa a equipe; a pressão costuma terminar com a regra desligada.',
      },
      {
        id: 'disable-all',
        text: 'Ligar como erro e acrescentar eslint-disable nas 340 linhas.',
        explanation:
          'Esconde a dívida em vez de registrá-la; ninguém volta para remover os disables.',
      },
      {
        id: 'skip',
        text: 'Desistir da regra: são ocorrências demais.',
        explanation: 'O problema continua crescendo.',
      },
    ],
    correctOptionIds: ['gradual'],
    hints: ['Como impedir que piore sem parar todo mundo?'],
    solution: [
      { type: 'paragraph', text: 'Meça, ligue como aviso com limite, reduza, então torne erro.' },
    ],
  },
  {
    id: 'lint-01-green-not-enough',
    kind: 'multiple-choice',
    title: 'O lint verde',
    difficulty: 'intermediate',
    conceptIds: ['tooling-lint'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Na etapa de depuração, por que o lint não apontou nada, e o que fazer?',
      },
    ],
    options: [
      {
        id: 'limits',
        text: 'Nenhuma regra ligada cobre esse caso: o link tem href e, no exemplo medido, link com href="#" e (click) passou sem aviso. É preciso um botão com nome acessível, e a verificação vem de axe e testes de componente.',
        explanation:
          'Correto. Medido com a configuração deste projeto: o exemplo com <a href="#" (click)> não gerou nenhum problema de lint. A correção: <button type="button" aria-label="Sair">…</button>.',
      },
      {
        id: 'bug',
        text: 'É um bug do ESLint.',
        explanation: 'Incorreto. O ESLint só aplica as regras configuradas.',
      },
      {
        id: 'more-rules',
        text: 'Ligar todas as regras disponíveis resolve qualquer caso.',
        explanation:
          'Nem todas existem para todos os problemas, e ligar tudo gera ruído; o lint é uma camada entre várias.',
      },
      {
        id: 'cache',
        text: 'O lint usou cache antigo.',
        explanation: 'Incorreto. O resultado se repete sem cache.',
      },
    ],
    correctOptionIds: ['limits'],
    hints: ['O que o lint verifica: tudo, ou as regras configuradas?'],
    solution: [
      {
        type: 'code',
        language: 'html',
        code: `<button type="button" aria-label="Sair" (click)="sair()"><svg aria-hidden="true">…</svg></button>`,
      },
    ],
  },
  {
    id: 'lint-01-which-tool',
    kind: 'multiple-choice',
    title: 'Qual ferramenta pega?',
    difficulty: 'intermediate',
    conceptIds: ['tooling-lint'],
    prompt: [{ type: 'paragraph', text: 'Qual associação está correta?' }],
    options: [
      {
        id: 'right',
        text: 'Aspas duplas misturadas com simples: Prettier. Imagem sem alt no template: ESLint (angular-eslint). Passar string onde se espera number: TypeScript. Total calculado errado: testes.',
        explanation: 'Correto. Cada camada cobre um tipo de problema; nenhuma substitui as outras.',
      },
      {
        id: 'lint-all',
        text: 'Todos os quatro: ESLint.',
        explanation: 'Incorreto. O lint não executa o código nem confere a lógica do cálculo.',
      },
      {
        id: 'ts-all',
        text: 'Todos os quatro: TypeScript strict.',
        explanation: 'Incorreto. O compilador não olha estilo nem acessibilidade de template.',
      },
      {
        id: 'tests-alt',
        text: 'Imagem sem alt: só testes.',
        explanation:
          'Testes também podem pegar, mas a regra alt-text do angular-eslint aponta antes, sem escrever teste.',
      },
    ],
    correctOptionIds: ['right'],
    hints: ['Qual ferramenta executa o código?'],
    solution: [{ type: 'paragraph', text: 'Formatação, lint, tipos e testes: quatro camadas.' }],
  },
  {
    id: 'lint-01-disable',
    kind: 'multiple-choice',
    title: 'Desativando uma regra',
    difficulty: 'intermediate',
    conceptIds: ['tooling-lint'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma biblioteca externa só aceita any num callback, e a regra no-explicit-any aponta erro. Qual é a melhor forma?',
      },
    ],
    options: [
      {
        id: 'line-reason',
        text: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a API da biblioteca X tipa o callback como any',
        explanation:
          'Correto. Desativa só aquela linha, só aquela regra, e o motivo fica escrito para quem revisar ou voltar ao código depois.',
      },
      {
        id: 'file',
        text: '/* eslint-disable */ no topo do arquivo.',
        explanation:
          'Desliga todas as regras no arquivo inteiro: esconde problemas que nada têm a ver com a biblioteca.',
      },
      {
        id: 'config-off',
        text: 'Desligar a regra no eslint.config.js.',
        explanation: 'Uma exceção vira regra para o projeto todo.',
      },
      {
        id: 'unknown',
        text: 'Usar unknown e as any no mesmo lugar para enganar a regra.',
        explanation: 'Contorna a regra sem explicar; o próximo leitor não sabe por quê.',
      },
    ],
    correctOptionIds: ['line-reason'],
    hints: ['Qual opção é a mais estreita e explica o motivo?'],
    solution: [{ type: 'paragraph', text: 'Exceção mínima, com regra e motivo explícitos.' }],
  },
  {
    id: 'lint-01-prettier-vs-eslint',
    kind: 'multiple-choice',
    title: 'Prettier ou ESLint?',
    difficulty: 'intermediate',
    conceptIds: ['tooling-lint'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Qual é a divisão de papéis recomendada entre Prettier e ESLint?',
      },
    ],
    options: [
      {
        id: 'split',
        text: 'Prettier cuida de toda a formatação; o ESLint fica com regras de qualidade e correção, sem regras de estilo que briguem com o Prettier.',
        explanation:
          'Correto. É a configuração deste projeto: o Prettier reescreve o estilo e o ESLint aponta problemas. Regras de formatação nos dois geram conflitos sem fim.',
      },
      {
        id: 'eslint-only',
        text: 'Só ESLint, com regras de formatação.',
        explanation:
          'Possível, mas mais lento, mais configuração e menos consistente que um formatador.',
      },
      {
        id: 'prettier-only',
        text: 'Só Prettier: ele também acha bugs.',
        explanation: 'Incorreto. O Prettier não aponta problemas; só formata.',
      },
      {
        id: 'both-format',
        text: 'Os dois formatando, para garantir.',
        explanation: 'Gera conflitos: um desfaz o que o outro fez.',
      },
    ],
    correctOptionIds: ['split'],
    hints: ['O Prettier aponta erros?'],
    solution: [{ type: 'paragraph', text: 'Formatação: Prettier. Qualidade: ESLint.' }],
  },
];
