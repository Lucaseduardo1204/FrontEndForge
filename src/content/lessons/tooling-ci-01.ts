import { Lesson } from '../../app/core/models/content.models';

/**
 * A pipeline for this very project. `src/content/arch-examples.spec.ts` checks that every
 * script it runs exists in package.json and that the build facts match angular.json (D-062).
 */
export const CI_WORKFLOW_YAML = `name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  qualidade:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci            # instala exatamente o que está no package-lock.json
      - run: npm run lint
      - run: npm test
      - run: npm run build     # falha se o orçamento de tamanho estourar`;

export const BUDGETS_JSON = `"production": {
  "budgets": [
    { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
    { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
  ],
  "outputHashing": "all"
}`;

export const NPM_CI_OUTPUT = `$ npm ci
npm error code EUSAGE
npm error \`npm ci\` can only install packages when your package.json and
npm error package-lock.json or npm-shrinkwrap.json are in sync. …
npm error Missing: rxjs@7.8.2 from lock file`;

export const TOOLING_CI_01: Lesson = {
  id: 'tooling-ci-01',
  moduleId: 'tooling-ci-deploy',
  title: 'CI/CD, configuração por ambiente e deploy',
  summary:
    'Automatizar lint, testes e build a cada mudança, separar configuração de segredo e publicar uma SPA que não quebra no primeiro recarregamento.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['tooling-ci', 'tooling-deploy'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: '"Funciona na minha máquina" é a frase que a integração contínua existe para eliminar. Um pipeline roda as mesmas verificações, do zero, em toda proposta de mudança: ninguém esquece de rodar os testes, e o que entra na branch principal passou pelos mesmos portões. O deploy, por sua vez, tem armadilhas próprias de SPA: configuração que vaza segredo e rotas que dão 404 ao recarregar.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Montar um pipeline com instalação reprodutível, lint, testes e build.',
            'Usar orçamentos de tamanho como portão de qualidade.',
            'Separar configuração pública de segredo.',
            'Publicar uma SPA com rotas e cache corretos.',
            'Saber o que monitorar depois de publicar.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A linha de inspeção da fábrica',
      blocks: [
        {
          type: 'paragraph',
          text: 'Toda peça passa pelas mesmas estações de inspeção antes de sair da fábrica, não importa quem a fez nem quão confiante estava. Se uma estação reprova, a peça volta. O pipeline é essa linha; o deploy é o caminhão, que também precisa de cuidado para a peça chegar inteira.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Pipeline, ambientes e publicação',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'npm ci instala exatamente as versões do package-lock.json e falha se ele não bate com o package.json. npm install pode atualizar o lockfile; num pipeline, isso esconderia diferenças entre a sua máquina e o servidor.',
            'A ordem barata primeiro: lint e testes falham em segundos; o build, mais lento, vem depois. Qualquer etapa com código de saída diferente de zero reprova o pipeline.',
            'Proteja a branch principal: merge só com o pipeline verde e revisão aprovada (lição de Git).',
            'Orçamentos (budgets) no angular.json transformam "o bundle cresceu demais" em falha de build, antes de chegar a quem usa.',
            'Configuração por ambiente (URL da API, nível de log) pode variar entre desenvolvimento, homologação e produção. Mas tudo que vai para o bundle é público: qualquer pessoa lê o JavaScript publicado. Segredo (chave de API privada, senha de banco) fica no servidor, nunca no frontend.',
            'Deploy de SPA: o servidor precisa responder o index.html para rotas que não são arquivos (/lessons/js-closures-01). Sem essa regra de reescrita, o link direto e o recarregamento dão 404, porque quem conhece a rota é o Angular, não o servidor.',
            'Cache: arquivos com hash no nome com cache longo; index.html com no-cache (lição de HTTP).',
            'Depois de publicar: monitore erros (um ErrorHandler global enviando para o seu backend, sem dados pessoais), tempo de carregamento e taxa de falha das requisições.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Medido',
          text: 'Num projeto de teste com rxjs no package.json e fora do lockfile, npm ci terminou com código 1 e não criou node_modules. E no build desta plataforma, os ids e textos das lições aparecem em texto puro nos arquivos .js publicados: é assim com qualquer valor que entre no bundle.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: o pipeline desta plataforma',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um workflow do GitHub Actions que roda os scripts reais deste projeto (os testes da plataforma conferem que cada um existe no package.json):',
        },
        {
          type: 'code',
          language: 'text',
          caption: '.github/workflows/ci.yml',
          code: CI_WORKFLOW_YAML,
        },
        {
          type: 'paragraph',
          text: 'Os orçamentos e o hash nos nomes vêm da configuração de produção do angular.json desta plataforma:',
        },
        { type: 'code', language: 'json', caption: 'angular.json (trecho)', code: BUDGETS_JSON },
        {
          type: 'paragraph',
          text: 'E é isto que o pipeline mostra quando alguém adiciona uma dependência sem atualizar o lockfile:',
        },
        { type: 'code', language: 'text', caption: 'Saída real do npm ci', code: NPM_CI_OUTPUT },
      ],
    },
    {
      kind: 'experiment',
      title: 'Experimente no seu projeto',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Rode npm run build e procure, nos arquivos de dist, um texto do seu código. Ele está lá, legível.',
            'Diminua o maximumError do orçamento initial para 100kB e rode o build: qual é a mensagem?',
            'Publique o build num servidor estático simples, abra uma rota interna e recarregue. Deu 404?',
            'Num repositório de teste, crie o workflow acima e abra um pull request com um teste falhando.',
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
          text: 'No laboratório, escreva o verificador que impede segredos e configurações inválidas de chegarem ao bundle. Depois, responda sobre npm ci.',
        },
      ],
      exerciseIds: ['lab-js-public-config', 'ci-01-npm-ci'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o 404 depois do deploy',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depois do deploy, a página inicial abre e a navegação pelos links funciona. Mas quem recebe o link /lessons/js-closures-01 por mensagem, ou aperta F5 numa lição, vê o 404 do servidor.',
        },
      ],
      exerciseIds: ['ci-01-spa-404'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Serviços de hospedagem estática têm uma opção de "SPA" ou de reescrita para index.html; em Nginx, é try_files $uri /index.html.',
            'Pré-visualizações por pull request (um deploy temporário para cada PR) deixam quem revisa testar a mudança de verdade.',
            'Integrações com IA ou serviços pagos passam por um backend seu, que guarda a chave: o frontend chama o seu backend.',
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
      exerciseIds: ['ci-01-secret', 'ci-01-order', 'ci-01-budget'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Pipeline: npm ci, lint, testes, build. Qualquer falha reprova.',
            'npm ci respeita o lockfile e falha se ele estiver desatualizado.',
            'Orçamentos transformam crescimento do bundle em falha de build.',
            'Tudo no bundle é público; segredo fica no servidor.',
            'SPA precisa de reescrita para index.html; cache longo só nos arquivos com hash.',
          ],
        },
      ],
    },
  ],
};
