import { Component, computed, inject, Injectable, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  provideRouter,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Routes,
  withComponentInputBinding,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { REDIRECT_TS, WILDCARD_FIRST_TS } from './exercises/angular-router-01.exercises';
import {
  APP_CONFIG_TS,
  DETAIL_TS,
  NAV_HTML,
  ROUTES_TS,
  STALE_DETAIL_TS,
} from './lessons/angular-router-01';

/**
 * Routes and components of lesson "angular-router-01", executed with the Router of this
 * project. Lazy loading uses a resolved promise here instead of import() (no chunk in tests).
 */
@Injectable({ providedIn: 'root' })
class CatalogoService {
  private readonly produtos = [
    { id: 1, nome: 'Café' },
    { id: 2, nome: 'Pão' },
    { id: 3, nome: 'Leite' },
  ];
  porId(id: number) {
    return this.produtos.find((p) => p.id === id);
  }
}

@Injectable({ providedIn: 'root' })
class SessaoService {
  readonly logado = signal(false);
}

@Component({ selector: 'app-lista', template: '<h1>Produtos</h1>' })
class ListaProdutos {}

@Component({
  selector: 'app-detalhe-produto',
  imports: [RouterLink],
  template: `
    @if (produto(); as p) {
      <h1>{{ p.nome }}</h1>
      <a [routerLink]="['/produtos', p.id + 1]">Próximo produto</a>
    } @else {
      <h1>Produto não encontrado</h1>
    }
  `,
})
class DetalheProduto {
  private readonly catalogo = inject(CatalogoService);

  readonly id = input.required<string>();
  readonly produto = computed(() => this.catalogo.porId(Number(this.id())));
}

/** The buggy version from the debugging step. */
@Component({
  selector: 'app-detalhe-velho',
  imports: [RouterLink],
  template: `<h1>{{ produto?.nome }}</h1>
    <a [routerLink]="['/produtos', (produto?.id ?? 0) + 1]">Próximo produto</a>`,
})
class DetalheVelho {
  private readonly rota = inject(ActivatedRoute);
  private readonly catalogo = inject(CatalogoService);

  readonly produto = this.catalogo.porId(Number(this.rota.snapshot.paramMap.get('id')));
}

@Component({ selector: 'app-login', template: '<h1>Entrar</h1>' })
class Login {}

@Component({ selector: 'app-nao-encontrada', template: '<h1>Página não encontrada</h1>' })
class NaoEncontrada {}

@Component({ selector: 'app-admin', template: '<h1>Administração</h1>' })
class Admin {}

const ADMIN_ROUTES: Routes = [{ path: '', component: Admin }];

const lessonRoutes = (
  detail: typeof DetalheProduto | typeof DetalheVelho = DetalheProduto,
): Routes => [
  { path: '', component: ListaProdutos, title: 'Produtos' },
  { path: 'produtos/:id', component: detail, title: 'Detalhe do produto' },
  {
    path: 'admin',
    canActivate: [() => inject(SessaoService).logado() || inject(Router).parseUrl('/login')],
    loadChildren: () => Promise.resolve(ADMIN_ROUTES),
  },
  { path: 'login', component: Login, title: 'Entrar' },
  { path: '**', component: NaoEncontrada, title: 'Página não encontrada' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `<nav aria-label="Principal">
      <a
        routerLink="/"
        routerLinkActive="ativo"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page"
        >Produtos</a
      >
      <a routerLink="/admin" routerLinkActive="ativo" ariaCurrentWhenActive="page">Admin</a>
    </nav>
    <router-outlet />`,
})
class Shell {}

async function setup(routes: Routes): Promise<RouterTestingHarness> {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes, withComponentInputBinding())],
  });
  return RouterTestingHarness.create();
}

const h1 = (harness: RouterTestingHarness) =>
  (harness.routeNativeElement as HTMLElement).querySelector('h1')?.textContent?.trim();

async function clickNext(harness: RouterTestingHarness): Promise<void> {
  (harness.routeNativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a')!.click();
  await harness.fixture.whenStable();
}

describe('router lesson (run on this project’s Angular)', () => {
  it('the :id parameter arrives as input() and selects the product', async () => {
    const harness = await setup(lessonRoutes());
    await harness.navigateByUrl('/produtos/2');

    expect(h1(harness)).toBe('Pão');
  });

  it('changing only the parameter reuses the component, and the input-based version follows', async () => {
    const harness = await setup(lessonRoutes());
    const first = await harness.navigateByUrl('/produtos/1', DetalheProduto);

    await clickNext(harness);

    expect(TestBed.inject(Router).url).toBe('/produtos/2');
    expect(h1(harness)).toBe('Pão');
    expect(harness.routeDebugElement!.componentInstance).toBe(first); // same instance
  });

  it('router-01-stale: the snapshot version keeps showing the first product', async () => {
    const harness = await setup(lessonRoutes(DetalheVelho));
    await harness.navigateByUrl('/produtos/1');

    await clickNext(harness);

    expect(TestBed.inject(Router).url).toBe('/produtos/2');
    expect(h1(harness)).toBe('Café');
  });

  it('router-01-redirect: without a session, /admin ends at /login', async () => {
    const harness = await setup(lessonRoutes());
    const router = TestBed.inject(Router);
    const logs: string[] = [];

    await new (Object.getPrototypeOf(async () => undefined).constructor)(
      'router',
      'console',
      REDIRECT_TS,
    )(router, { log: (v: string) => logs.push(v) });
    harness.detectChanges();

    expect(logs).toEqual(['/login']);
    expect(h1(harness)).toBe('Entrar');
  });

  it('with a session, the guard lets the lazy admin area load', async () => {
    const harness = await setup(lessonRoutes());
    TestBed.inject(SessaoService).logado.set(true);

    await harness.navigateByUrl('/admin');

    expect(TestBed.inject(Router).url).toBe('/admin');
    expect(h1(harness)).toBe('Administração');
  });

  it('router-01-order: with ** first, every URL shows the not-found page', async () => {
    expect(WILDCARD_FIRST_TS.indexOf("'**'")).toBeLessThan(
      WILDCARD_FIRST_TS.indexOf("'produtos/:id'"),
    );
    const harness = await setup([
      { path: '**', component: NaoEncontrada },
      { path: '', component: ListaProdutos },
      { path: 'produtos/:id', component: DetalheProduto },
    ]);

    await harness.navigateByUrl('/produtos/1');

    expect(h1(harness)).toBe('Página não encontrada');
  });

  it('routerLinkActive with ariaCurrentWhenActive marks the current page', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(lessonRoutes(), withComponentInputBinding())],
    });
    const fixture = TestBed.createComponent(Shell);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const [home, admin] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('nav a'),
    );

    expect(home.getAttribute('aria-current')).toBe('page');
    expect(home.classList).toContain('ativo');
    expect(admin.hasAttribute('aria-current')).toBe(false);
  });

  it('the lesson shows the same code that is tested here (drift guard)', () => {
    const lesson = [ROUTES_TS, APP_CONFIG_TS, DETAIL_TS, NAV_HTML, STALE_DETAIL_TS].join('\n');
    for (const fragment of [
      "{ path: 'produtos/:id', component: DetalheProduto, title: 'Detalhe do produto' },",
      "canActivate: [() => inject(SessaoService).logado() || inject(Router).parseUrl('/login')],",
      "loadChildren: () => import('./admin/admin.routes'),",
      "{ path: '**', component: NaoEncontrada, title: 'Página não encontrada' },",
      'provideRouter(routes, withComponentInputBinding())',
      'readonly id = input.required<string>();',
      'readonly produto = computed(() => this.catalogo.porId(Number(this.id())));',
      '<a [routerLink]="[\'/produtos\', p.id + 1]">Próximo produto</a>',
      'ariaCurrentWhenActive="page"',
      "this.rota.snapshot.paramMap.get('id')",
    ]) {
      expect(lesson, fragment).toContain(fragment);
    }
  });
});
