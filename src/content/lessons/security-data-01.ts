import { Lesson } from '../../app/core/models/content.models';

/**
 * Measured in this project (D-055): a source string (the progress storage key) appears verbatim
 * in the production main-*.js; production builds emit no .map files (sourceMap only in the
 * development configuration); `npm audit` reports 0 vulnerabilities.
 */
export const ENV_LEAK_TS = `// environment.ts
export const environment = {
  apiUrl: '/api',                      // tudo bem: é público por natureza
  pagamentosChave: 'sk_live_51H…',      // VAZAMENTO: vai inteiro para o bundle
};`;

export const ENV_FIX_TS = `// environment.ts: só configuração pública
export const environment = {
  apiUrl: '/api',
};

// O frontend pede ao SEU backend; só o backend conhece a chave de pagamentos.
this.http.post('/api/assinaturas', { plano: 'mensal' });`;

export const LOG_MASK_TS = `// Antes de registrar um erro, tire o que é sensível.
console.error('Falha no cadastro', mascararDadosSensiveis(dadosDoFormulario));
// { nome: 'Ana', senha: '[removido]', cartao: '[removido]' }`;

export const SUPPLY_CHAIN_SHELL = `npm ci                  # instala exatamente o que está no package-lock.json
npm audit               # vulnerabilidades conhecidas nas dependências
npm audit --omit=dev    # só o que vai para produção
npm view pacote         # quem publica, quantas versões, repositório`;

export const SECURITY_DATA_01: Lesson = {
  id: 'security-data-01',
  moduleId: 'security-data-supply-chain',
  title: 'Segredos, dados sensíveis e dependências',
  summary:
    'O que nunca pode ir para o frontend, como evitar que dados pessoais vazem em logs, URLs e mensagens de erro, e como uma dependência pode virar a porta de entrada.',
  estimatedMinutes: 40,
  difficulty: 'intermediate',
  conceptIds: ['security-secrets', 'security-sensitive-data', 'security-supply-chain'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nem todo incidente de segurança é um ataque sofisticado. Muitos são exposições acidentais: uma chave de API no bundle, um log com senhas, um número de documento na URL, uma mensagem de erro que mostra a estrutura do banco, uma dependência que foi comprometida e ninguém percebeu.',
        },
        {
          type: 'paragraph',
          text: 'No Brasil, a LGPD (Lei 13.709/2018) trata dados pessoais e exige cuidado com coleta, armazenamento e compartilhamento. Do lado do frontend, isso se traduz em hábitos concretos.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Saber o que vai para o navegador e, portanto, é público.',
            'Manter segredos no backend.',
            'Evitar dados sensíveis em logs, URLs, armazenamento local e mensagens de erro.',
            'Avaliar e manter dependências com segurança.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'A vitrine',
      blocks: [
        {
          type: 'paragraph',
          text: 'O frontend é a vitrine de uma loja: tudo o que está nela pode ser visto por qualquer pessoa na calçada, por mais escondido que pareça atrás de um enfeite. O cofre fica nos fundos (o backend). Colocar a chave do cofre na vitrine, mesmo dentro de uma caixa fechada (minificação, Base64), é deixá-la à vista.',
        },
        {
          type: 'paragraph',
          text: 'As dependências são os fornecedores da loja: se um deles entrega uma caixa adulterada, ela entra pela porta da frente com o seu crachá.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'O que é público, o que é sensível e o que vem de fora',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Tudo o que está no código do frontend vai para o navegador: textos, URLs, configurações e os valores de environment.ts. Minificar não esconde strings; Base64 é só outra forma de escrever.',
            'Segredos (chaves de serviços pagos, tokens de integração, credenciais de banco) ficam no backend. O frontend chama o seu backend, que usa o segredo. Se uma chave vazou, troque-a: apagar do código não a desfaz.',
            'Chaves que os próprios fornecedores chamam de "públicas" (de mapas ou de pagamento com cartão no navegador) existem e podem ficar no frontend, desde que restritas por domínio e permissão no painel do fornecedor.',
            'Source maps permitem ler o código original no navegador. O Angular gera mapas só na configuração de desenvolvimento; não publique mapas de produção sem decidir isso conscientemente.',
            'Dados sensíveis fora da URL: o endereço fica no histórico, nos logs de servidores e proxies e pode ir no cabeçalho Referer para outros sites. Use o corpo de um POST.',
            'Nada sensível no localStorage ou sessionStorage: qualquer script da página lê (lição de sessões).',
            'Logs e ferramentas de monitoramento de erros recebem o que você mandar: remova senhas, tokens, documentos e dados de cartão antes de registrar.',
            'Mensagens de erro para a pessoa explicam o que fazer, sem detalhes internos (pilha, consultas, caminhos de arquivos); os detalhes ficam nos logs do servidor.',
            'Dependências: cada pacote roda com o mesmo poder do seu código, e npm install pode executar scripts de instalação. Antes de adicionar, veja quem mantém, se é ativo, quantas dependências traz e se o nome é o certo (pacotes falsos com nomes parecidos existem). Use o lockfile, npm ci na integração contínua, npm audit e atualizações regulares.',
            'HTTPS em todas as páginas e chamadas: protege dados em trânsito e é exigido por cookies Secure e muitas APIs do navegador.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: a chave no environment',
      blocks: [
        {
          type: 'paragraph',
          text: 'Um padrão que aparece em projetos reais:',
        },
        { type: 'code', language: 'typescript', caption: 'Vazamento', code: ENV_LEAK_TS },
        {
          type: 'paragraph',
          text: 'Nesta própria plataforma, a chave usada para salvar o progresso no navegador ("frontend-forge.progress") aparece, letra por letra, no arquivo main-*.js do build de produção. Com uma chave de API seria igual. A correção move o segredo para o backend:',
        },
        { type: 'code', language: 'typescript', caption: 'Correção', code: ENV_FIX_TS },
        {
          type: 'paragraph',
          text: 'Para logs, uma função que remove dados sensíveis antes de registrar (você a escreve no laboratório):',
        },
        { type: 'code', language: 'typescript', caption: 'Registro de erro', code: LOG_MASK_TS },
        {
          type: 'paragraph',
          text: 'E as ferramentas do dia a dia para dependências:',
        },
        { type: 'code', language: 'shell', caption: 'Terminal', code: SUPPLY_CHAIN_SHELL },
        {
          type: 'callout',
          tone: 'info',
          title: 'Isto foi medido',
          text: 'Nesta plataforma: a string do código-fonte aparece no main-*.js de produção; o build de produção não gera arquivos .map; e npm audit não aponta vulnerabilidades. Cada dependência do projeto tem uma justificativa registrada nas decisões de arquitetura.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Investigue no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Num projeto Angular, coloque uma string única num arquivo, rode npx ng build e procure por ela nos arquivos de dist com o seu editor ou com grep.',
            'Abra um site qualquer, vá na aba Fontes (Sources) do DevTools e procure por "key" ou "token" nos scripts.',
            'Rode npm audit no seu projeto e leia uma das vulnerabilidades: ela afeta código que vai para produção?',
            'Rode npm view @angular/core e veja quem publica o pacote e onde fica o repositório.',
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
          text: 'No laboratório, escreva a função que remove dados sensíveis antes de registrar. Depois, responda sobre o environment.',
        },
      ],
      exerciseIds: ['lab-js-mask-sensitive', 'data-01-environment'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o link de redefinição de senha',
      blocks: [
        {
          type: 'code',
          language: 'text',
          caption: 'Link enviado por e-mail e aberto pela pessoa',
          code: `https://app.exemplo.com/redefinir?email=ana@exemplo.com&cpf=12345678900&token=a1b2c3`,
        },
      ],
      exerciseIds: ['data-01-url'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Ferramentas de varredura de segredos (como as do GitHub) procuram chaves em commits; se uma for encontrada, revogue-a, mesmo que o commit seja apagado.',
            'Dependabot ou Renovate abrem pull requests de atualização de dependências; a integração contínua roda os testes antes de aceitar.',
            'Monitoramento de erros no frontend é útil, mas configure o que é enviado: muitas ferramentas capturam a URL, o texto da tela e os dados de requisições.',
            'Esta plataforma não envia nada para fora do navegador: não há analytics nem monitoramento, e o progresso fica apenas com você.',
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
      exerciseIds: ['data-01-error-message', 'data-01-dependency', 'data-01-leaked-key'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'O frontend inteiro é público; segredos só no backend.',
            'Chave vazada se revoga, não se apaga.',
            'Dados sensíveis fora de URLs, do armazenamento local e dos logs.',
            'Mensagens de erro úteis para a pessoa, detalhes só no servidor.',
            'Dependências: avalie antes, trave com lockfile, audite e atualize.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na Biblioteca: "Segurança no frontend: o essencial".',
        },
      ],
    },
  ],
};
