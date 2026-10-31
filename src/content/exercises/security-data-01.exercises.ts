import { Exercise } from '../../app/core/models/content.models';

export const SECURITY_DATA_01_EXERCISES: readonly Exercise[] = [
  {
    id: 'lab-js-mask-sensitive',
    kind: 'code',
    language: 'javascript',
    title: 'Remova dados sensíveis antes de registrar',
    difficulty: 'intermediate',
    conceptIds: ['security-sensitive-data'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Escreva mascararDadosSensiveis(valor), usada antes de enviar dados a logs ou a uma ferramenta de monitoramento de erros. Ela devolve uma cópia em que os campos sensíveis viram "[removido]".',
      },
    ],
    requirements: [
      'Um campo é sensível quando o nome dele contém (sem diferenciar maiúsculas) senha, password, token, cpf, cartao, card, secret ou segredo.',
      'O valor de um campo sensível vira "[removido]", seja ele texto, número ou objeto.',
      'Objetos e arrays aninhados são percorridos.',
      'O valor recebido não é alterado.',
      'Valores que não são objetos (texto, número, null) são devolvidos como estão.',
    ],
    examples: [
      {
        input: "mascararDadosSensiveis({ nome: 'Ana', senha: '123' })",
        output: "{ nome: 'Ana', senha: '[removido]' }",
      },
      {
        input: "mascararDadosSensiveis({ pagamento: { cartao: { numero: '4111' } } })",
        output: "{ pagamento: { cartao: '[removido]' } }",
      },
    ],
    starterCode: `function mascararDadosSensiveis(valor) {
  // Seu código aqui
  return valor;
}

console.log(mascararDadosSensiveis({ nome: 'Ana', senha: '123' }));
`,
    tests: [
      {
        id: 'flat',
        description: 'Remove campos sensíveis de um objeto simples',
        source:
          "expect(mascararDadosSensiveis({ nome: 'Ana', senha: '123', email: 'ana@exemplo.com' })).toEqual({ nome: 'Ana', senha: '[removido]', email: 'ana@exemplo.com' });",
      },
      {
        id: 'case',
        description: 'Reconhece o nome em qualquer posição e com maiúsculas',
        source:
          "expect(mascararDadosSensiveis({ accessToken: 'x', CPF: 1, numeroDoCartao: '4111', clientSecret: 's' })).toEqual({ accessToken: '[removido]', CPF: '[removido]', numeroDoCartao: '[removido]', clientSecret: '[removido]' });",
      },
      {
        id: 'nested',
        description: 'Percorre objetos aninhados',
        source:
          "expect(mascararDadosSensiveis({ usuario: { nome: 'Ana', password: 'p' }, pedido: { id: 7 } })).toEqual({ usuario: { nome: 'Ana', password: '[removido]' }, pedido: { id: 7 } });",
      },
      {
        id: 'arrays',
        description: 'Percorre arrays',
        source:
          "expect(mascararDadosSensiveis([{ token: 'a' }, { id: 2 }, 'texto'])).toEqual([{ token: '[removido]' }, { id: 2 }, 'texto']);",
      },
      {
        id: 'whole-object',
        description: 'Um campo sensível com objeto dentro vira "[removido]" por inteiro',
        source:
          "expect(mascararDadosSensiveis({ cartao: { numero: '4111', validade: '12/30' } })).toEqual({ cartao: '[removido]' });",
      },
      {
        id: 'immutable',
        description: 'Não altera o valor recebido',
        source:
          "const dados = { senha: '123', perfil: { token: 't' } }; mascararDadosSensiveis(dados); expect(dados).toEqual({ senha: '123', perfil: { token: 't' } });",
      },
      {
        id: 'primitives',
        description: 'Devolve texto, número e null como estão',
        source:
          "expect(mascararDadosSensiveis('senha')).toBe('senha'); expect(mascararDadosSensiveis(42)).toBe(42); expect(mascararDadosSensiveis(null)).toBe(null);",
      },
    ],
    hints: [
      'Para arrays, use map chamando a própria função em cada item.',
      'Para objetos, monte um novo com Object.entries e decida para cada chave: sensível vira "[removido]", não sensível chama a função de novo no valor.',
      'Uma expressão regular com a flag i testa o nome: /senha|password|token|.../i.test(chave).',
    ],
    solution: [
      {
        type: 'code',
        language: 'javascript',
        code: `const SENSIVEL = /senha|password|token|cpf|cartao|card|secret|segredo/i;

function mascararDadosSensiveis(valor) {
  if (Array.isArray(valor)) return valor.map(mascararDadosSensiveis);
  if (valor === null || typeof valor !== 'object') return valor;

  // Objeto novo: o original fica intacto.
  return Object.fromEntries(
    Object.entries(valor).map(([chave, v]) => [
      chave,
      SENSIVEL.test(chave) ? '[removido]' : mascararDadosSensiveis(v),
    ]),
  );
}`,
      },
      {
        type: 'paragraph',
        text: 'Lista de nomes proibidos é uma rede de segurança, não garantia: campos com nomes inesperados ainda passam. Em sistemas reais, prefira registrar só os campos que você escolheu (lista de permitidos) e use esta função como proteção extra.',
      },
    ],
  },
  {
    id: 'data-01-environment',
    kind: 'multiple-choice',
    title: 'O que pode ficar no environment.ts?',
    difficulty: 'intermediate',
    conceptIds: ['security-secrets'],
    prompt: [
      { type: 'paragraph', text: 'Qual destes valores pode ficar no environment.ts do frontend?' },
    ],
    options: [
      {
        id: 'api-url',
        text: 'O endereço base da sua API, como /api ou https://api.exemplo.com.',
        explanation: 'Correto. O endereço aparece de qualquer jeito na aba Rede; não é segredo.',
      },
      {
        id: 'db',
        text: 'A senha do banco de dados, para o frontend consultar direto.',
        explanation:
          'Incorreto. Qualquer pessoa leria a senha no bundle e acessaria o banco inteiro.',
      },
      {
        id: 'secret-key',
        text: 'A chave secreta de um serviço de pagamentos (sk_live_...).',
        explanation:
          'Incorreto. Com ela, qualquer pessoa faria cobranças e estornos em nome da empresa. Fica no backend.',
      },
      {
        id: 'jwt-secret',
        text: 'O segredo usado para assinar os tokens de sessão.',
        explanation: 'Incorreto. Quem tem esse segredo cria sessões falsas de qualquer usuário.',
      },
    ],
    correctOptionIds: ['api-url'],
    hints: ['Quais desses valores qualquer pessoa já consegue ver usando a aplicação?'],
    solution: [
      {
        type: 'paragraph',
        text: 'environment.ts é configuração pública. Segredo no frontend deixa de ser segredo.',
      },
    ],
  },
  {
    id: 'data-01-url',
    kind: 'multiple-choice',
    title: 'Dados na URL',
    difficulty: 'intermediate',
    conceptIds: ['security-sensitive-data'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O link de redefinição de senha da etapa de depuração carrega e-mail, CPF e token na URL. Qual é o problema e a correção?',
      },
    ],
    options: [
      {
        id: 'minimal',
        text: 'A URL fica no histórico, em logs de servidores e proxies e pode ir no cabeçalho Referer. O link deve ter só um token aleatório, de uso único e com validade curta; o servidor sabe a que conta ele pertence.',
        explanation:
          'Correto. E-mail e CPF não precisam estar no link: o token identifica o pedido. Um token de uso único e curto limita o estrago se o link vazar.',
      },
      {
        id: 'https',
        text: 'Nenhum, porque o site usa HTTPS.',
        explanation:
          'Incorreto. HTTPS protege a URL no caminho pela rede, mas não no histórico, nos logs do servidor ou em capturas de tela.',
      },
      {
        id: 'base64',
        text: 'Codificar os parâmetros em Base64.',
        explanation: 'Incorreto. Base64 é reversível por qualquer pessoa; os dados continuam lá.',
      },
      {
        id: 'post-form',
        text: 'Trocar o link por um formulário que a pessoa preenche com o CPF.',
        explanation:
          'Muda o problema de lugar sem resolvê-lo: o essencial é que o link não carregue dados pessoais e que o token seja de uso único.',
      },
    ],
    correctOptionIds: ['minimal'],
    hints: ['Onde uma URL fica guardada depois de aberta?'],
    solution: [
      {
        type: 'code',
        language: 'text',
        code: `https://app.exemplo.com/redefinir?token=<aleatório, uso único, expira em 30 min>`,
      },
    ],
  },
  {
    id: 'data-01-error-message',
    kind: 'multiple-choice',
    title: 'A mensagem de erro',
    difficulty: 'intermediate',
    conceptIds: ['security-sensitive-data'],
    prompt: [
      {
        type: 'paragraph',
        text: 'O cadastro falhou por um erro no banco. Qual mensagem mostrar à pessoa?',
      },
    ],
    options: [
      {
        id: 'friendly',
        text: '"Não foi possível concluir o cadastro agora. Tente de novo em alguns minutos." Os detalhes técnicos vão para o log do servidor.',
        explanation:
          'Correto. A pessoa sabe o que fazer, e quem investiga encontra os detalhes no lugar certo.',
      },
      {
        id: 'stack',
        text: 'A pilha completa do erro, para ajudar o suporte.',
        explanation:
          'Incorreto. Mostra caminhos, versões e estrutura interna para qualquer um, inclusive para quem procura falhas.',
      },
      {
        id: 'sql',
        text: 'A consulta SQL que falhou.',
        explanation:
          'Incorreto. Revela nomes de tabelas e colunas, que ajudam a montar ataques de injeção.',
      },
      {
        id: 'nothing',
        text: 'Nenhuma mensagem: o botão simplesmente não faz nada.',
        explanation:
          'Incorreto. A pessoa fica sem saber se o cadastro aconteceu e tenta de novo, às vezes criando duplicatas.',
      },
    ],
    correctOptionIds: ['friendly'],
    hints: ['Quem lê a mensagem, e o que essa pessoa precisa saber?'],
    solution: [
      {
        type: 'paragraph',
        text: 'Mensagem útil para a pessoa; detalhes no log do servidor, sem dados sensíveis.',
      },
    ],
  },
  {
    id: 'data-01-dependency',
    kind: 'multiple-choice',
    title: 'Uma dependência nova',
    difficulty: 'intermediate',
    conceptIds: ['security-supply-chain'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Você precisa formatar datas e encontra "anguIar-date-utils" (com i maiúsculo no lugar do l), com 40 downloads por semana. O que fazer?',
      },
    ],
    options: [
      {
        id: 'check',
        text: 'Desconfiar: o nome imita outro pacote. Verificar se a plataforma já resolve (Intl.DateTimeFormat, DatePipe), e, se precisar de um pacote, escolher um mantido, conhecido, com repositório público, conferindo o nome exato.',
        explanation:
          'Correto. Pacotes com nomes parecidos com os de pacotes conhecidos são uma forma comum de ataque à cadeia de suprimentos. E o próprio Angular já formata datas.',
      },
      {
        id: 'install',
        text: 'Instalar: se está no npm, foi verificado.',
        explanation:
          'Incorreto. Qualquer pessoa pode publicar no npm, e estar lá não significa que alguém revisou o código.',
      },
      {
        id: 'audit-only',
        text: 'Instalar e rodar npm audit; se não acusar nada, está seguro.',
        explanation:
          'Incorreto. npm audit só conhece vulnerabilidades já registradas. Um pacote malicioso novo não aparece lá, e o script de instalação já rodou.',
      },
      {
        id: 'copy',
        text: 'Copiar o código do pacote para o projeto, para não depender dele.',
        explanation:
          'Incorreto. Se o código é malicioso, copiá-lo traz o problema junto, sem nem a chance de receber correções.',
      },
    ],
    correctOptionIds: ['check'],
    hints: ['Leia o nome do pacote com atenção.'],
    solution: [
      {
        type: 'paragraph',
        text: 'Antes de adicionar: a plataforma já resolve? O pacote é mantido e conhecido? O nome é exato? Depois: lockfile, npm ci, npm audit e atualizações.',
      },
    ],
  },
  {
    id: 'data-01-leaked-key',
    kind: 'order-steps',
    title: 'A chave vazou: e agora?',
    difficulty: 'intermediate',
    conceptIds: ['security-secrets'],
    prompt: [
      {
        type: 'paragraph',
        text: 'Uma chave secreta de pagamentos foi publicada no bundle de produção. Ordene a resposta, do primeiro ao último passo.',
      },
    ],
    items: [
      {
        id: 'revoke',
        text: 'Revogar a chave no painel do fornecedor e gerar uma nova',
        why: 'Enquanto a chave vale, qualquer pessoa pode usá-la. Remover do código não invalida cópias já feitas.',
      },
      {
        id: 'backend',
        text: 'Guardar a nova chave só no backend e criar o endpoint que a usa',
        why: 'A nova chave não pode repetir o caminho da antiga.',
      },
      {
        id: 'remove',
        text: 'Remover a chave do frontend e publicar a versão corrigida',
        why: 'O frontend passa a chamar o endpoint do backend.',
      },
      {
        id: 'investigate',
        text: 'Verificar nos registros do fornecedor se a chave foi usada indevidamente',
        why: 'Depois de conter o problema, descubra se houve dano e a quem avisar.',
      },
      {
        id: 'prevent',
        text: 'Adicionar varredura de segredos ao repositório e à integração contínua',
        why: 'Evita que o próximo vazamento chegue à produção.',
      },
    ],
    explanation:
      'Primeiro conter (revogar), depois corrigir (backend e frontend), depois investigar e prevenir. Apagar a chave do código sem revogá-la não resolve: ela já foi copiada.',
    hints: ['O que impede o uso da chave que já vazou?'],
    solution: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Revogar',
          'Nova chave no backend',
          'Corrigir o frontend',
          'Investigar o uso',
          'Prevenir',
        ],
      },
    ],
  },
];
