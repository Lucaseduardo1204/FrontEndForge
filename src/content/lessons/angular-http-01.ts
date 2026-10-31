import { Lesson } from '../../app/core/models/content.models';

/**
 * Executed with HttpTestingController in `src/content/angular-http.spec.ts` (drift guard there).
 * httpResource behaviour (idle when the URL is undefined, cancellation, value() throwing on
 * error) was measured there and in the official guide (angular.dev/guide/http/http-resource).
 */
export const HTTP_CONFIG_TS = `import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';

/** Toda requisição sai pedindo respostas em português. */
export const idioma: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'Accept-Language': 'pt-BR' } }));

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([idioma]))],
};`;

export const SEARCH_TS = `import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface Produto {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-busca-produtos',
  template: \`
    <label for="busca">Buscar produto</label>
    <input id="busca" type="search" [value]="busca()" (input)="buscar($event)" />

    @if (produtos.isLoading()) {
      <p role="status">Carregando…</p>
    } @else if (produtos.error()) {
      <p role="alert">
        Não foi possível carregar os produtos.
        <button type="button" (click)="produtos.reload()">Tentar de novo</button>
      </p>
    } @else if (produtos.hasValue()) {
      <ul>
        @for (produto of produtos.value(); track produto.id) {
          <li>{{ produto.nome }}</li>
        } @empty {
          <li>Nenhum produto encontrado.</li>
        }
      </ul>
    } @else {
      <p>Digite pelo menos 2 letras para buscar.</p>
    }
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscaProdutos {
  protected readonly busca = signal('');

  /** Sem URL (undefined), nenhuma requisição é feita. */
  protected readonly produtos = httpResource<Produto[]>(() =>
    this.busca().length < 2
      ? undefined
      : { url: '/api/produtos', params: { busca: this.busca() } },
  );

  protected buscar(evento: Event) {
    this.busca.set((evento.target as HTMLInputElement).value);
  }
}`;

export const CREATE_ACCOUNT_TS = `private readonly http = inject(HttpClient);

protected async enviar(evento: Event) {
  evento.preventDefault();
  await submit(this.cadastro, async (dados) => {
    try {
      await firstValueFrom(this.http.post('/api/contas', dados().value()));
      this.contaCriada.set(dados().value().nome);
      return undefined;
    } catch (erro) {
      if (erro instanceof HttpErrorResponse && erro.status === 409) {
        // O servidor diz qual campo tem problema: a mensagem aparece nele.
        return { fieldTree: dados.email, kind: 'server', message: 'Este e-mail já tem uma conta.' };
      }
      return { fieldTree: dados, kind: 'server', message: 'Não foi possível criar a conta. Tente de novo.' };
    }
  });
}`;

export const ANGULAR_HTTP_01: Lesson = {
  id: 'angular-http-01',
  moduleId: 'angular-http-data',
  title: 'Dados do servidor: httpResource e HttpClient',
  summary:
    'Ler dados com httpResource (carregamento, erro, vazio e cancelamento prontos), enviar dados com HttpClient e levar os erros do servidor para o campo certo do formulário.',
  estimatedMinutes: 50,
  difficulty: 'intermediate',
  conceptIds: ['angular-http', 'js-async'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Na lição de assincronismo você escreveu à mão os estados de carregamento, a conferência de resposta.ok e o descarte de respostas atrasadas. No Angular, a maior parte disso já vem pronta, desde que você use a ferramenta certa para cada tarefa: httpResource para ler dados que dependem do estado da tela, e HttpClient para enviar.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Configurar o HttpClient e um interceptor.',
            'Ler dados com httpResource e mostrar carregamento, erro, vazio e resultado.',
            'Não fazer requisição enquanto não há o que buscar.',
            'Enviar dados com HttpClient e tratar o erro do servidor no campo certo.',
            'Saber o que nunca deve ir para o frontend.',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O painel de chegadas e o balcão',
      blocks: [
        {
          type: 'paragraph',
          text: 'httpResource é como o painel de chegadas de um aeroporto: você diz qual voo acompanhar, e o painel se atualiza sozinho, mostra "atrasado" ou "cancelado" e troca de voo se você mudar a busca. Ele só lê.',
        },
        {
          type: 'paragraph',
          text: 'Para despachar uma mala, você vai ao balcão: é uma ação, feita uma vez, que pode dar certo ou errado. Esse é o HttpClient no envio de um formulário.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Ler, enviar e tratar erros',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'provideHttpClient() disponibiliza o HttpClient; withInterceptors([...]) registra funções que podem alterar toda requisição e resposta (cabeçalhos, tratamento de erro, registro).',
            'httpResource(() => url ou { url, params, ... }) faz um GET e expõe o resultado como signals: value(), isLoading(), error(), status() e hasValue(). A função é reativa: se um signal lido nela muda, a requisição é refeita.',
            'Se a função devolve undefined, nenhuma requisição é feita e o status fica idle. É assim que se espera a pessoa digitar o suficiente.',
            'Se a URL muda com uma requisição em andamento, a anterior é cancelada antes da nova. A corrida da lição de assincronismo não acontece.',
            'Com erro, ler value() lança uma exceção. No template, confira error() ou hasValue() antes de usar value().',
            'reload() repete a requisição atual, útil para um botão "Tentar de novo".',
            'Para enviar (POST, PUT, DELETE), use o HttpClient. A documentação do Angular recomenda não usar httpResource para mutações. HttpClient devolve Observables; firstValueFrom transforma em promise para usar com await.',
            'Um erro de HTTP chega como HttpErrorResponse, com status (404, 409, 500...). Falha de rede, sem resposta nenhuma, chega com status 0.',
          ],
        },
        {
          type: 'callout',
          tone: 'security',
          title: 'Nada de segredo no frontend',
          text: 'Todo o código do frontend chega ao navegador e pode ser lido. Chaves de API de serviços pagos, tokens de integração e senhas de banco nunca entram no bundle, nem num interceptor, nem num arquivo de ambiente. O frontend chama o seu backend, e só o backend guarda e usa esses segredos.',
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: busca e criação de conta',
      blocks: [
        { type: 'code', language: 'typescript', caption: 'app.config.ts', code: HTTP_CONFIG_TS },
        {
          type: 'paragraph',
          text: 'A busca de produtos: com menos de 2 letras, nada é pedido ao servidor. Cada estado tem sua mensagem, e value() só é lido depois de hasValue().',
        },
        { type: 'code', language: 'typescript', caption: 'busca-produtos.ts', code: SEARCH_TS },
        {
          type: 'paragraph',
          text: 'O envio do cadastro da lição anterior, agora com o servidor. Se o servidor responde 409 (o e-mail já existe), a ação devolve um erro com fieldTree apontando para o campo de e-mail, e a mensagem aparece nele, como qualquer outro erro de validação. Outros erros vão para o formulário como um todo.',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'criar-conta.ts (envio)',
          code: CREATE_ACCOUNT_TS,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Este código é testado',
          text: 'Os testes da plataforma executam a busca e o cadastro com o HttpClient do Angular usado no projeto e um servidor simulado (HttpTestingController): nenhuma requisição com menos de 2 letras, cancelamento da busca anterior, interceptor aplicado, botão "Tentar de novo" e o 409 aparecendo no campo de e-mail.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'paragraph',
          text: 'Sem um backend próprio, use uma API pública de testes, como a https://jsonplaceholder.typicode.com (só para leitura de dados fictícios de exemplo).',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Troque a URL da busca por https://jsonplaceholder.typicode.com/users e mostre o campo name.',
            'Na aba Rede do DevTools, ative a limitação "3G lenta" e digite rápido: veja requisições marcadas como canceladas.',
            'Troque a URL por uma que não existe e observe a mensagem de erro e o botão "Tentar de novo".',
            'Remova a condição @else if (produtos.hasValue()) e use value() direto com a URL errada: leia o erro no console.',
            'Confira na aba Rede o cabeçalho Accept-Language adicionado pelo interceptor.',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [{ type: 'paragraph', text: 'Responda pensando na busca e no cadastro.' }],
      exerciseIds: ['http-01-idle', 'http-01-conflict'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: a tela que quebra quando a API falha',
      blocks: [
        {
          type: 'code',
          language: 'html',
          caption: 'Funciona até a API responder 500',
          code: `@for (produto of produtos.value() ?? []; track produto.id) {
  <li>{{ produto.nome }}</li>
}`,
        },
      ],
      exerciseIds: ['http-01-value-error'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Interceptors são o lugar para o token de sessão do usuário (Authorization), tratamento global de 401 e registro de erros, sem repetir isso em cada chamada.',
            'Valide no frontend os dados que chegam de APIs que você não controla, como na lição de TypeScript; httpResource aceita uma função parse para isso.',
            'HttpClient com Observables continua comum em projetos existentes, principalmente com operadores do RxJS como switchMap.',
            'Em testes, provideHttpClientTesting e HttpTestingController substituem o servidor: cada resposta, erro e atraso é controlado pelo teste.',
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
      exerciseIds: ['http-01-cancel', 'http-01-mutation', 'http-01-secret'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'httpResource para ler: estados como signals, idle com undefined, cancelamento automático.',
            'Confira error() ou hasValue() antes de value().',
            'HttpClient para enviar; firstValueFrom para usar com await.',
            'Erros do servidor viram erros de campo quando a ação do submit devolve fieldTree.',
            'Segredos só no backend.',
          ],
        },
      ],
    },
  ],
};
