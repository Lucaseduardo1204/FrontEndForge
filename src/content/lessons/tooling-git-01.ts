import { Lesson } from '../../app/core/models/content.models';

/**
 * Git behaviour shown here (conflict markers, revert, amend, --force-with-lease vs --force) was
 * measured with git 2.53 in throwaway repositories (D-058).
 */
export const FLOW_SHELL = `git switch -c feat/busca-produtos      # branch curta, um assunto
# ... trabalho, testes, lint ...
git add -p                              # escolhe o que entra, trecho a trecho
git commit -m "feat(busca): busca produtos pelo nome"
git push -u origin feat/busca-produtos  # abre o pull request a partir daqui

# Enquanto a revisão acontece, a main andou:
git fetch origin
git rebase origin/main                  # reaplica seus commits sobre a main atual
git push --force-with-lease             # só sobrescreve se ninguém mais enviou nada`;

export const CONFLICT_TEXT = `titulo: Lista de compras
<<<<<<< HEAD
cor: verde
=======
cor: cinza
>>>>>>> tema-escuro`;

export const COMMITS_TEXT = `feat(carrinho): aplica cupom de desconto
fix(busca): ignora espaços nas pontas do termo
docs: explica como rodar os testes
refactor(carrinho)!: troca o formato dos itens

BREAKING CHANGE: itens agora usam preco em centavos`;

export const TOOLING_GIT_01: Lesson = {
  id: 'tooling-git-01',
  moduleId: 'tooling-team-flow',
  title: 'Git e fluxo de equipe: commits, pull requests, conflitos e versões',
  summary:
    'Trabalhar com outras pessoas no mesmo código sem perder trabalho: commits que contam a história, pull requests revisáveis, conflitos resolvidos com calma e versões que comunicam o tipo de mudança.',
  estimatedMinutes: 45,
  difficulty: 'intermediate',
  conceptIds: ['tooling-git', 'tooling-versioning'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Programar sozinho e programar em equipe são trabalhos diferentes. Em equipe, o código muda enquanto você trabalha, outras pessoas leem o que você escreveu, e um comando errado pode apagar o trabalho de alguém. O Git é a ferramenta; o fluxo de trabalho é o combinado que torna isso seguro.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Trabalhar em branches curtas e escrever commits que explicam o porquê.',
            'Abrir pull requests fáceis de revisar e revisar os dos outros.',
            'Resolver conflitos entendendo os dois lados.',
            'Desfazer mudanças sem reescrever o histórico compartilhado.',
            'Versionar com SemVer e mensagens padronizadas.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O documento compartilhado com histórico',
      blocks: [
        {
          type: 'paragraph',
          text: 'Pense num documento escrito por várias pessoas, em que cada uma trabalha numa cópia e depois propõe juntar as mudanças. Cada "salvar com comentário" é um commit; a cópia de trabalho é uma branch; a proposta de juntar, com espaço para comentários, é o pull request. Quando duas pessoas mudam a mesma frase, alguém precisa decidir qual versão fica: é o conflito.',
        },
        {
          type: 'paragraph',
          text: 'E há uma regra de convivência: nunca apague o histórico que outras pessoas já têm. Para desfazer, acrescente uma correção.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Commits, branches, revisão e versões',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Um commit por mudança coerente, com mensagem no imperativo que diga o que e, quando não for óbvio, por quê. "Corrige" sozinho não ajuda ninguém daqui a seis meses.',
            'Conventional Commits padroniza o início da mensagem: feat (funcionalidade), fix (correção), docs, refactor, test, chore. Um ! depois do tipo, ou um rodapé BREAKING CHANGE:, marca uma mudança incompatível.',
            'Branches curtas, uma por assunto, a partir da main atualizada. Quanto mais tempo uma branch vive, maior o conflito no fim.',
            'Pull request pequeno, com descrição (o que muda, por quê, como testar) e a integração contínua verde. Revisão é sobre o código, não sobre a pessoa: pergunte, sugira, explique.',
            'Conflito: o Git marca o trecho com <<<<<<< (a sua versão), ======= e >>>>>>> (a outra). Decida o resultado certo (às vezes uma combinação dos dois), apague os marcadores, rode os testes e só então conclua.',
            'Desfazer: git revert cria um commit novo que desfaz outro, sem reescrever nada; é o seguro para branches compartilhadas. commit --amend e rebase reescrevem commits (o hash muda), então use só no que ainda não foi compartilhado, ou na sua própria branch.',
            'Se precisar sobrescrever a sua branch remota depois de um rebase, use git push --force-with-lease: ele recusa se alguém enviou algo que você ainda não viu. git push --force apaga esse trabalho sem avisar.',
            'SemVer (MAIOR.MENOR.CORREÇÃO): mudança incompatível sobe a MAIOR e zera as outras; funcionalidade compatível sobe a MENOR e zera a CORREÇÃO; correção sobe só a CORREÇÃO. Com Conventional Commits, a próxima versão pode ser calculada a partir das mensagens.',
            'Ferramentas que mantêm o padrão sem esforço: ESLint e Prettier no editor e na integração contínua, ganchos de commit (husky, lint-staged) e proteção da branch principal.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: do branch ao merge',
      blocks: [
        { type: 'code', language: 'shell', caption: 'Terminal', code: FLOW_SHELL },
        {
          type: 'paragraph',
          text: 'Um conflito real, gerado ao juntar duas branches que mudaram a mesma linha:',
        },
        {
          type: 'code',
          language: 'text',
          caption: 'config.txt durante o merge',
          code: CONFLICT_TEXT,
        },
        {
          type: 'paragraph',
          text: 'Medido num repositório de teste: depois que outra pessoa enviou um commit, git push --force-with-lease foi recusado ("stale info") e o commit dela ficou salvo; git push --force, no mesmo cenário, apagou o commit dela do remoto.',
        },
        {
          type: 'paragraph',
          text: 'Mensagens no padrão Conventional Commits, das quais a próxima versão pode ser calculada:',
        },
        { type: 'code', language: 'text', caption: 'git log (mensagens)', code: COMMITS_TEXT },
        {
          type: 'paragraph',
          text: 'Com a versão atual 1.4.2, esses commits levam a 2.0.0, por causa da mudança incompatível. Sem ela, seriam 1.5.0 (há um feat); só com fix e docs, 1.4.3.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Pratique num repositório de teste',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Crie uma pasta, rode git init e faça dois commits.',
            'Crie uma branch, mude uma linha, volte para a main, mude a mesma linha de outro jeito e faça merge: resolva o conflito à mão.',
            'Use git revert no último commit e veja o histórico com git log --oneline.',
            'Crie um repositório "remoto" com git init --bare e dois clones; simule duas pessoas e compare --force-with-lease com --force.',
            'Escreva cinco mensagens de commit no padrão Conventional Commits para mudanças que você fez recentemente.',
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
          text: 'No laboratório, calcule a próxima versão a partir das mensagens de commit. Depois, resolva um conflito.',
        },
      ],
      exerciseIds: ['lab-js-semver', 'git-01-conflict'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o commit que sumiu',
      blocks: [
        {
          type: 'paragraph',
          text: 'Ana corrigiu a mensagem do último commit com --amend e rodou git push --force. Bia diz que o commit que ela tinha enviado uma hora antes sumiu da main.',
        },
      ],
      exerciseIds: ['git-01-force'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Ferramentas como semantic-release e release-please leem Conventional Commits e geram a versão e o changelog automaticamente.',
            'Protejam a main: merge só por pull request, com revisão e integração contínua verde.',
            'Segredos nunca entram em commits; se entrarem, revogue (lição de segurança): apagar o commit não desfaz o vazamento.',
            'Esta plataforma registra cada decisão técnica num arquivo próprio; num projeto em equipe, esse registro costuma acompanhar o pull request que fez a mudança.',
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
      exerciseIds: ['git-01-revert', 'git-01-version', 'git-01-pr'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Commits coerentes com mensagens que explicam; Conventional Commits padroniza.',
            'Branches curtas, pull requests pequenos, revisão gentil e objetiva.',
            'Conflito: entenda os dois lados, decida, teste, conclua.',
            'revert no histórico compartilhado; amend e rebase só no que é seu; --force-with-lease, nunca --force.',
            'SemVer: incompatível sobe a maior, funcionalidade a menor, correção a última.',
          ],
        },
      ],
    },
  ],
};
