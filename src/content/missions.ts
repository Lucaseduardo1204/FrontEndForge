import { Mission } from '../app/core/models/content.models';

/** Missions: realistic problems made of tasks (exercises), usually diagnose → fix. */
export const MISSIONS: readonly Mission[] = [
  {
    id: 'mission-responsive-layout',
    title: 'Corrija um layout que quebra em telas pequenas',
    context: [
      {
        type: 'paragraph',
        text: 'O time de produto lançou a página de planos. No desktop está ótima; no celular, os clientes precisam rolar para o lado para ver o preço. O suporte já recebeu reclamações e a página de planos é a que mais converte.',
      },
    ],
    objective:
      'Encontrar a causa do vazamento horizontal e corrigir o CSS para que os cartões se adaptem ao espaço disponível.',
    functionalRequirements: [
      'Os três planos continuam visíveis e legíveis em qualquer largura.',
      'Em telas largas, os cartões ficam lado a lado.',
    ],
    technicalConstraints: [
      'Alterar apenas o CSS, sem mudar o HTML.',
      'Sem @media: o layout deve se adaptar ao contêiner (layout intrínseco). A prévia do laboratório não muda de tamanho, então os testes medem o layout mudando a largura do contêiner.',
    ],
    acceptanceCriteria: [
      'Com 360px de largura, nenhum elemento ultrapassa a borda direita.',
      'Com 1000px, os três cartões ficam na mesma linha.',
      'As imagens não ficam mais largas que o cartão.',
    ],
    difficulty: 'intermediate',
    hints: [
      'Primeiro descubra todas as causas: costuma haver mais de uma largura rígida.',
      'Pense em "quanto cada cartão gostaria de ter" em vez de "quanto ele tem".',
    ],
    exerciseIds: ['mission-layout-diagnosis', 'mission-layout-fix'],
    debrief: [
      {
        type: 'paragraph',
        text: 'Layouts quebram no celular quase sempre por larguras rígidas somadas: contêiner fixo, itens que não encolhem e mídia com largura fixa. A correção robusta é declarar intenções (base, mínimo, máximo) e deixar o navegador distribuir o espaço.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'flex: 1 1 250px e grid com repeat(auto-fit, minmax(…)) criam layouts que se adaptam sem media queries.',
          'max-width: 100% em imagens é quase sempre o que você quer.',
          'Media queries continuam úteis para mudanças de layout de página. Para componentes, layouts intrínsecos (e container queries) os deixam reutilizáveis em qualquer lugar.',
        ],
      },
    ],
    conceptIds: ['css-responsive-layout'],
  },
  {
    id: 'mission-typing-bug',
    title: 'Identifique um problema de tipagem',
    context: [
      {
        type: 'paragraph',
        text: 'O carrinho de compras mostra totais como "R$ 0105" para alguns pedidos. O código é TypeScript, compila sem erros e tem testes, todos passando, com dados de exemplo em que o preço é número. O bug só aparece com dados reais da API.',
      },
    ],
    objective:
      'Entender por que o TypeScript não pegou o erro e corrigir a fronteira com a API para que dados inesperados sejam tratados em runtime.',
    functionalRequirements: [
      'O total é correto para preços vindos como número ou como texto numérico.',
      'Dados inválidos geram um erro claro, em vez de um total errado.',
    ],
    technicalConstraints: [
      'A entrada da função é unknown: nada de any nem de as para "convencer" o compilador.',
      'Os tipos do laboratório são removidos, não verificados: o comportamento é o que os testes avaliam.',
    ],
    acceptanceCriteria: [
      'totalDoPedido soma preços numéricos e textos numéricos.',
      'Lança erro para preço inválido e para entrada que não é lista.',
    ],
    difficulty: 'intermediate',
    hints: [
      'Onde os tipos do código param de corresponder aos dados reais?',
      'any e as dizem ao compilador "confie em mim". Quem verifica se é verdade?',
    ],
    exerciseIds: ['mission-typing-predict', 'mission-typing-fix'],
    debrief: [
      {
        type: 'paragraph',
        text: 'Tipos do TypeScript existem só em tempo de compilação. Tudo que vem de fora do seu código (respostas de API, JSON, localStorage, formulários) chega sem garantia nenhuma. Anotar esses dados com o tipo esperado, ou usar any e as, transforma a anotação numa promessa sem verificação.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Receba dados externos como unknown e prove o formato com narrowing (typeof, Array.isArray, checagens de campos).',
          'Testes com dados de exemplo "perfeitos" não pegam esse bug: inclua casos com dados malformados.',
          'No Angular, HttpClient.get<T>() não valida a resposta: o T é só uma anotação.',
        ],
      },
    ],
    conceptIds: ['ts-runtime-validation'],
  },
  {
    id: 'mission-xss',
    title: 'Identifique uma falha de segurança',
    context: [
      {
        type: 'paragraph',
        text: 'Uma pessoa avisou o time que, ao abrir os comentários de um post, o navegador fez uma requisição estranha para um domínio desconhecido. O código que exibe comentários foi escrito às pressas e usa innerHTML.',
      },
      {
        type: 'callout',
        tone: 'security',
        title: 'Exemplo vulnerável, com finalidade didática',
        text: 'O código desta missão é inseguro de propósito, para que você reconheça o padrão. A correção e a forma recomendada aparecem nas tarefas e na explicação final.',
      },
    ],
    objective:
      'Entender o impacto do XSS armazenado e corrigir a forma de exibir texto do usuário.',
    functionalRequirements: [
      'Comentários continuam aparecendo com autor e texto.',
      'Nenhum conteúdo enviado por usuários é interpretado como HTML.',
    ],
    technicalConstraints: [
      'Preferir textContent e createElement; escapar apenas quando for inevitável montar HTML como string.',
      'Não usar listas de bloqueio (remover "<script>" e afins).',
    ],
    acceptanceCriteria: [
      'Você explica por que o onerror executa mesmo com innerHTML.',
      'escaparHtml neutraliza &, <, >, " e \' sem escapar duas vezes.',
    ],
    difficulty: 'intermediate',
    hints: [
      'O problema não é o <script>: é qualquer HTML com atributos de evento.',
      'A correção não deve depender de adivinhar o que o atacante vai mandar.',
    ],
    exerciseIds: ['mission-xss-impact', 'mission-xss-escape'],
    debrief: [
      {
        type: 'paragraph',
        text: 'XSS acontece quando dados viram código. A regra é tratar texto do usuário sempre como texto: textContent no DOM, interpolação {{ }} no Angular, e escape quando você realmente precisa montar HTML como string. Filtros por lista de bloqueio falham porque existem infinitas formas de escrever o mesmo ataque.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Defesa em camadas: além de renderizar com segurança, uma Content Security Policy sem unsafe-inline impede handlers inline mesmo se um bug escapar.',
          'Cookies de sessão com HttpOnly não são lidos por document.cookie. Isso reduz o dano, mas não elimina o XSS.',
          'Validar no frontend não protege: o atacante envia direto para a API. O servidor também deve validar, e quem renderiza deve escapar.',
        ],
      },
    ],
    conceptIds: ['web-xss'],
  },
  {
    id: 'mission-double-charge',
    title: 'O pagamento cobrado duas vezes',
    context: [
      {
        type: 'paragraph',
        text: 'Depois de uma instabilidade no servidor de pagamentos, o suporte recebeu dezenas de reclamações de clientes cobrados duas ou três vezes. Ao mesmo tempo, a listagem de pedidos, que deveria se recuperar sozinha de falhas passageiras, mostra erro quando o servidor responde 429 (pedidos demais). As duas coisas passam pela mesma função de retentativa.',
      },
    ],
    objective:
      'Diagnosticar por que a retentativa repete o que não deve e desiste do que deveria repetir, e reescrevê-la com regras explícitas.',
    functionalRequirements: [
      'Repetir só métodos idempotentes, e só em falhas passageiras (rede, 429, 502, 503, 504).',
      'Esperar entre as tentativas, com intervalo crescente.',
      'Quando todas falharem, entregar a última resposta ou o último erro, sem engolir nada.',
    ],
    technicalConstraints: [
      'A espera é injetada (esperar(ms)), para os testes não dependerem do relógio.',
      'Sem bibliotecas: só a função.',
    ],
    acceptanceCriteria: [
      'Um POST é chamado uma única vez, mesmo com 503 ou erro de rede.',
      'Um GET com 503, 503, 200 devolve 200 depois de esperar 100 e 200 ms.',
      'Erros que não são passageiros (404, 500) não são repetidos.',
    ],
    difficulty: 'intermediate',
    hints: [
      'Liste quais métodos podem ser repetidos sem efeito duplicado (lição de HTTP).',
      'Um 500 costuma ser um bug no servidor: repetir não ajuda e só aumenta a carga.',
    ],
    exerciseIds: ['mission-retry-diagnosis', 'mission-retry-fix'],
    debrief: [
      {
        type: 'paragraph',
        text: 'Retentativa é uma ferramenta de resiliência que, mal configurada, vira um gerador de duplicatas e de sobrecarga. As regras que você implementou são as mesmas de clientes HTTP maduros: só idempotentes, só falhas passageiras, com espera crescente e limite.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Para repetir um POST com segurança, a API precisa aceitar uma chave de idempotência enviada pelo cliente, que faz o servidor reconhecer a repetição.',
          'Espera crescente (100, 200, 400 ms…) dá tempo ao servidor de se recuperar; em produção, soma-se um pequeno valor aleatório para os clientes não voltarem todos juntos.',
          'O RxJS tem o operador retry com as opções count e delay para Observables, mas a decisão de quando repetir continua sendo sua.',
        ],
      },
    ],
    conceptIds: ['web-http'],
  },
  {
    id: 'mission-checkout-form',
    title: 'O checkout que ninguém consegue terminar',
    context: [
      {
        type: 'paragraph',
        text: 'A taxa de abandono do checkout dobrou depois da última versão. As reclamações: "o CEP some quando digito o hífen", "cliquei em aplicar cupom e o pedido foi enviado sem endereço", "o leitor de tela só diz campo de edição" e "o celular não preenche meu e-mail".',
      },
    ],
    objective:
      'Encontrar as causas em HTML e corrigir o formulário usando só recursos nativos: tipos, atributos, rótulos e agrupamento.',
    functionalRequirements: [
      'O CEP aceita o formato com e sem hífen e mantém o zero à esquerda.',
      'Aplicar o cupom não envia o pedido.',
      'Todo campo é anunciado com um nome; as opções de entrega têm um título de grupo.',
      'O navegador consegue preencher e-mail e CEP automaticamente.',
    ],
    technicalConstraints: [
      'Só HTML: nada de JavaScript para corrigir comportamento que o HTML já oferece.',
      'Manter os atributos name, que o servidor usa.',
    ],
    acceptanceCriteria: [
      'O botão "Aplicar cupom" é type="button": clicar nele não envia o pedido.',
      'O CEP não é type="number", tem teclado numérico e um pattern que aceita 01310-100 e 01310100.',
      'Todos os campos têm rótulo; os radios de entrega estão num fieldset com legend.',
    ],
    difficulty: 'introductory',
    hints: [
      'Cada reclamação aponta para um atributo ou elemento diferente.',
      'Qual é o type padrão de um <button> dentro de um <form>?',
    ],
    exerciseIds: ['mission-checkout-diagnosis', 'mission-checkout-fix'],
    debrief: [
      {
        type: 'paragraph',
        text: 'Nenhuma das quatro reclamações exigia JavaScript: todas eram atributos ausentes ou errados. Formulários são o ponto onde o HTML nativo mais entrega de graça, e onde mais se perde quando ele é ignorado.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Códigos numéricos são texto: inputmode="numeric" com pattern.',
          'Todo <button> declara o type: submit para enviar, button para o resto.',
          'autocomplete e rótulos ajudam todo mundo, e são indispensáveis para quem usa tecnologia assistiva.',
          'Os atributos ajudam quem preenche; o servidor continua validando tudo.',
        ],
      },
    ],
    conceptIds: ['html-forms', 'html-form-labels'],
  },
  {
    id: 'mission-dashboard-state',
    title: 'O painel com números que não batem',
    context: [
      {
        type: 'paragraph',
        text: 'O painel de tarefas da equipe mostra "3 pendentes" quando a lista tem duas. Depois de concluir a mesma tarefa duas vezes (um clique duplo), o contador de concluídas pula de dois em dois. E um componente de ordenação, ao ordenar a lista "só para exibir", bagunçou a ordem do painel inteiro.',
      },
    ],
    objective:
      'Reescrever o estado do painel com uma única fonte de verdade, derivando os números e protegendo a lista de alterações por fora.',
    functionalRequirements: [
      'total, pendentes e concluidas sempre coerentes com a lista, depois de qualquer sequência de ações.',
      'Concluir uma tarefa já concluída não muda nada.',
      'Quem lê a lista não consegue alterar o estado do painel.',
    ],
    technicalConstraints: [
      'Nenhum contador guardado: os números são calculados a partir da lista.',
      'Ids começam em 1 e nunca se repetem, mesmo depois de remover tarefas.',
    ],
    acceptanceCriteria: [
      'Depois de adicionar três, concluir uma duas vezes e remover uma pendente: total 2, pendentes 1, concluídas 1.',
      'Ordenar ou alterar o array devolvido por tarefas() não altera o painel.',
    ],
    difficulty: 'intermediate',
    hints: [
      'Quantos lugares guardam "quantas pendentes existem"? Deveria ser um só.',
      'Devolver a própria lista interna entrega a chave do estado a quem chamou.',
    ],
    exerciseIds: ['mission-dashboard-diagnosis', 'mission-dashboard-fix'],
    debrief: [
      {
        type: 'paragraph',
        text: 'Os três sintomas tinham duas causas: números guardados em vez de derivados, e estado interno exposto por referência. São as mesmas causas de bugs em services Angular com signals: total em signal à parte em vez de computed, e o array do signal alterado por quem o leu.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Fonte única de verdade: guarde o mínimo; derive o resto.',
          'Exponha cópias (ou valores somente leitura, como asReadonly() e readonly T[]).',
          'Operações idempotentes (concluir duas vezes = concluir uma) tornam a interface resistente a cliques duplicados.',
        ],
      },
    ],
    conceptIds: ['arch-derived-state', 'js-mutability'],
  },
  {
    id: 'mission-order-import',
    title: 'A importação de pedidos que mente',
    context: [
      {
        type: 'paragraph',
        text: 'O financeiro importa pedidos de uma planilha exportada pelo sistema antigo. Depois da última importação, um pedido de R$ 1.234,56 apareceu como R$ 1,23, alguns totais ficaram com centavos quebrados, um status "estornado" (que não existe no sistema) entrou como válido e várias linhas sumiram sem nenhum aviso.',
      },
    ],
    objective:
      'Encontrar por que a importação aceita dados errados e descarta linhas em silêncio, e reescrevê-la para importar só o que é válido e relatar cada problema com a linha e o motivo.',
    functionalRequirements: [
      'Totais no formato brasileiro (com ou sem separador de milhar) convertidos exatamente para centavos.',
      'Só status da lista oficial; ausente vira "pendente".',
      'Cada linha recusada aparece no relatório de erros, com o número da linha e o motivo.',
    ],
    technicalConstraints: [
      'Nenhum cálculo de dinheiro em ponto flutuante.',
      'Nenhum catch vazio: erro esperado vira item do relatório; o resto não é engolido.',
      'A lista STATUS é a fonte única dos status válidos.',
    ],
    acceptanceCriteria: [
      '"1.234,56" vira 123456 centavos e "19,90" vira 1990.',
      'Uma linha com status "estornado" vai para os erros com o motivo "status inválido".',
      'Nenhuma linha some: cada uma vira pedido ou erro.',
    ],
    difficulty: 'intermediate',
    hints: [
      'Teste a função antiga com "1.234,56" e "19,90" e compare com o que a planilha mostra.',
      'Quantas linhas entraram e quantas saíram? A diferença está em algum lugar.',
    ],
    exerciseIds: ['mission-import-diagnosis', 'mission-import-fix'],
    debrief: [
      {
        type: 'paragraph',
        text: 'A importação antiga falhava de três jeitos silenciosos: convertia texto em número com regras que não são as do formato brasileiro, aceitava qualquer status e escondia os erros num catch vazio. Dados errados que entram em silêncio são piores que dados recusados: alguém vai tomar decisões em cima deles.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Fronteiras com dados externos (planilhas, APIs, formulários) validam tudo e relatam o que recusaram.',
          'Dinheiro em centavos, convertido a partir do texto, nunca de um float.',
          'Um relatório de erros com linha e motivo transforma "sumiram pedidos" em uma lista de correções.',
        ],
      },
    ],
    conceptIds: ['js-numbers', 'js-errors', 'ts-const-satisfies'],
  },
];
