import { Lesson } from '../../app/core/models/content.models';

/** These tests run, as written, in `src/content/testing-examples.spec.ts` (drift guard). */
export const SEARCH_SPEC_TS = `import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BuscaProdutos } from './busca-produtos';

/** Procura o campo como uma pessoa procuraria: pelo texto do rótulo. */
function campoPorRotulo(tela: HTMLElement, rotulo: string): HTMLInputElement {
  const label = Array.from(tela.querySelectorAll('label')).find(
    (l) => l.textContent?.trim() === rotulo,
  );
  return label!.control as HTMLInputElement;
}

describe('BuscaProdutos', () => {
  let servidor: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servidor = TestBed.inject(HttpTestingController);
  });

  afterEach(() => servidor.verify()); // nenhuma requisição esquecida ou inesperada

  it('mostra os produtos encontrados', async () => {
    const fixture = TestBed.createComponent(BuscaProdutos);
    const tela: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const campo = campoPorRotulo(tela, 'Buscar produto');
    campo.value = 'café';
    campo.dispatchEvent(new Event('input'));
    TestBed.tick();

    servidor
      .expectOne((req) => req.url === '/api/produtos' && req.params.get('busca') === 'café')
      .flush([{ id: 1, nome: 'Café torrado' }]);
    await fixture.whenStable();

    expect(tela.textContent).toContain('Café torrado');
  });

  it('oferece tentar de novo quando a API falha', async () => {
    const fixture = TestBed.createComponent(BuscaProdutos);
    const tela: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const campo = campoPorRotulo(tela, 'Buscar produto');
    campo.value = 'café';
    campo.dispatchEvent(new Event('input'));
    TestBed.tick();
    servidor.expectOne((req) => req.url === '/api/produtos').flush('erro', {
      status: 500,
      statusText: 'Server Error',
    });
    await fixture.whenStable();

    const alerta = tela.querySelector('[role="alert"]');
    expect(alerta?.textContent).toContain('Não foi possível carregar os produtos.');
    expect(alerta?.querySelector('button')?.textContent).toContain('Tentar de novo');
  });
});`;

export const FRAGILE_TEST_TS = `// Frágil: depende de classe CSS e da ordem dos elementos.
const botao = tela.querySelectorAll('.btn')[2] as HTMLButtonElement;

// Robusto: encontra o botão pelo que a pessoa vê.
const botao = Array.from(tela.querySelectorAll('button')).find(
  (b) => b.textContent?.trim() === 'Tentar de novo',
)!;`;

export const CI_YAML = `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`;

export const TESTING_ANGULAR_01: Lesson = {
  id: 'testing-angular-01',
  moduleId: 'testing-angular-apps',
  title: 'Testando aplicações Angular: componentes, HTTP e integração contínua',
  summary:
    'Testar componentes como uma pessoa usa a tela, substituir o servidor nos testes, escolher o que vai para testes ponta a ponta e rodar tudo automaticamente a cada mudança.',
  estimatedMinutes: 50,
  difficulty: 'intermediate',
  conceptIds: ['testing-angular', 'testing-strategy'],
  steps: [
    {
      kind: 'context',
      title: 'Por que isso importa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Testes de componente são os que mais quebram sem motivo quando mal escritos: mudam uma classe CSS e dez testes caem, trocam a ordem de dois botões e outros cinco. E são os que mais protegem quando bem escritos, porque verificam o que a pessoa realmente vê e faz.',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            'Montar componentes com TestBed e interagir pelo DOM.',
            'Encontrar elementos como uma pessoa encontraria: rótulo, papel, texto.',
            'Substituir o servidor com HttpTestingController.',
            'Decidir o que vai para testes ponta a ponta e o que verificar de acessibilidade.',
            'Rodar lint, testes e build automaticamente a cada mudança (integração contínua).',
          ],
        },
      ],
    },
    {
      kind: 'intuition',
      title: 'O cliente oculto',
      blocks: [
        {
          type: 'paragraph',
          text: 'Lojas contratam clientes ocultos: pessoas que compram como qualquer cliente e relatam a experiência. O cliente oculto não abre o caixa para ver o código do sistema; ele procura o produto pela placa, pede pelo nome e confere o troco.',
        },
        {
          type: 'paragraph',
          text: 'Um bom teste de componente faz o mesmo: encontra o campo pelo rótulo, digita, clica no botão pelo texto e confere o que aparece. Se a equipe reorganizar o código interno sem mudar a experiência, o teste continua passando. Se a experiência quebrar, ele falha.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Ferramentas e estratégia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Ferramentas: o Angular CLI das versões atuais gera projetos com Vitest (rodado por ng test) e um DOM simulado; é o que esta plataforma usa. TestBed é a API do Angular para montar componentes com suas dependências.',
            'TestBed.createComponent monta o componente; await fixture.whenStable() espera a tela se atualizar. Em aplicações sem zone.js (o padrão atual), TestBed.tick() executa as atualizações pendentes depois de mudar um signal.',
            'Interaja como a pessoa: preencha o campo e dispare o evento input; clique no botão; confira o texto. Encontre elementos por rótulo, papel (role) e texto visível, não por classes CSS ou métodos privados do componente.',
            'provideHttpClientTesting com HttpTestingController substitui o servidor: expectOne encontra a requisição, flush responde, e verify, no fim, garante que nenhuma requisição ficou sem resposta ou foi feita sem querer.',
            'Cuidado: whenStable() espera as requisições pendentes. Chame-o depois de responder com flush, não antes, ou o teste fica esperando para sempre.',
            'Services: troque por uma versão falsa com { provide: Service, useValue: falso } quando o teste é do componente; teste o service real separadamente.',
            'Rotas: RouterTestingHarness navega de verdade e devolve o componente da rota.',
            'Testes ponta a ponta (como Playwright, gratuito e de código aberto) abrem o navegador de verdade e percorrem fluxos inteiros. O Angular CLI não instala um por padrão; ng e2e oferece opções. Use para poucos fluxos críticos: entrar, comprar, salvar.',
            'Acessibilidade: ferramentas automáticas (como o axe, usado num teste ponta a ponta) acham parte dos problemas, como rótulos faltando e contraste. Navegar com o teclado e com um leitor de tela continua necessário.',
            'Integração contínua: a cada push ou pull request, um serviço (como GitHub Actions) instala as dependências e roda lint, testes e build. Nada entra na branch principal com a verificação vermelha.',
          ],
        },
      ],
    },
    {
      kind: 'guided-code',
      title: 'Exemplo real: testando a busca de produtos',
      blocks: [
        {
          type: 'paragraph',
          text: 'Estes são testes do componente BuscaProdutos, da lição de HTTP. Eles encontram o campo pelo rótulo, respondem como o servidor e conferem o que a pessoa veria.',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'busca-produtos.spec.ts',
          code: SEARCH_SPEC_TS,
        },
        {
          type: 'paragraph',
          text: 'A diferença entre um teste frágil e um robusto costuma ser só a forma de encontrar o elemento:',
        },
        {
          type: 'code',
          language: 'typescript',
          caption: 'Encontrar elementos',
          code: FRAGILE_TEST_TS,
        },
        {
          type: 'paragraph',
          text: 'E um fluxo de integração contínua mínimo, que roda as mesmas verificações que você roda localmente:',
        },
        { type: 'code', language: 'text', caption: '.github/workflows/ci.yml', code: CI_YAML },
        {
          type: 'callout',
          tone: 'info',
          title: 'Estes testes são executados',
          text: 'Os dois testes de BuscaProdutos acima rodam, como estão escritos, na suíte da plataforma.',
        },
      ],
    },
    {
      kind: 'experiment',
      title: 'Monte no seu computador',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'No projeto da lição de HTTP, crie o spec acima e rode npx ng test.',
            'Comente a linha do flush e rode de novo: o que o verify do afterEach diz?',
            'Mova o await fixture.whenStable() para antes do flush e observe o teste parar até o tempo limite.',
            'Mude o texto do rótulo no componente para "Pesquisar produto". Qual teste falha, e isso é bom ou ruim?',
            'Troque a classe CSS da lista no componente: algum teste quebra? Deveria?',
          ],
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Prática',
      blocks: [{ type: 'paragraph', text: 'Responda pensando nos testes da busca.' }],
      exerciseIds: ['ng-test-01-query', 'ng-test-01-verify'],
    },
    {
      kind: 'debugging',
      title: 'Depuração: o teste que nunca termina',
      blocks: [
        {
          type: 'code',
          language: 'typescript',
          caption: 'Para até estourar o tempo limite',
          code: `campo.value = 'café';
campo.dispatchEvent(new Event('input'));
TestBed.tick();
await fixture.whenStable(); // fica esperando aqui
servidor.expectOne((req) => req.url === '/api/produtos').flush([]);`,
        },
      ],
      exerciseIds: ['ng-test-01-whenstable'],
    },
    {
      kind: 'real-world',
      title: 'Isso no dia a dia',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Esta plataforma verifica as próprias telas assim: testes de integração montam as rotas reais. Além disso, durante o desenvolvimento, o build de produção foi auditado no Chromium com o axe, em várias larguras de tela, com scripts fora da suíte de testes.',
            'Testing Library (@testing-library/angular) oferece funções prontas para encontrar elementos por rótulo, papel e texto, no mesmo espírito do campoPorRotulo.',
            'Um teste que falhou por mudança de texto visível é um aviso útil: alguém mudou o que a pessoa vê, e o teste pede uma decisão.',
            'Proteja a branch principal: pull requests só entram com a integração contínua verde.',
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
      exerciseIds: ['ng-test-01-fake', 'ng-test-01-e2e', 'ng-test-01-ci'],
    },
    {
      kind: 'review',
      title: 'Revisão',
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            'Teste como a pessoa usa: rótulo, papel e texto, não classes e métodos privados.',
            'HttpTestingController: expectOne, flush e verify no afterEach.',
            'whenStable depois do flush, nunca antes.',
            'Services falsos nos testes de componente; poucos testes ponta a ponta, para os fluxos críticos.',
            'Integração contínua roda lint, testes e build a cada mudança.',
          ],
        },
      ],
    },
  ],
};
