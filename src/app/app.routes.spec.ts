import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AppTitleStrategy } from './core/navigation/app-title-strategy';
import { ProgressRepository } from './core/persistence/progress-repository';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
        {
          provide: ProgressRepository,
          useValue: {
            load: async () => null,
            save: async () => undefined,
            clear: async () => undefined,
          },
        },
      ],
    });
  });

  async function open(url: string): Promise<HTMLElement> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  it('renders the settings page with its title', async () => {
    const page = await open('/settings');

    expect(page.querySelector('h1')?.textContent).toContain('Configurações');
    expect(TestBed.inject(Title).getTitle()).toBe('Configurações · Frontend Forge');
  });

  it('marks the current section in the navigation', async () => {
    const page = await open('/settings');
    const current = page.querySelectorAll('.shell__sidebar a[aria-current="page"]');

    expect(current.length).toBe(1);
    expect(current[0].textContent).toContain('Configurações');
  });

  it('has no navigation item marked as planned: every area is implemented', async () => {
    const page = await open('/');

    expect(page.querySelectorAll('.shell__sidebar .badge--planned').length).toBe(0);
  });

  it('shows a not-found page for unknown URLs', async () => {
    const page = await open('/does-not-exist');

    expect(page.querySelector('h1')?.textContent).toContain('Página não encontrada');
  });

  it('links every navigation item to a route that is not the not-found page', async () => {
    const harness = await RouterTestingHarness.create('/');
    const root = harness.routeNativeElement as HTMLElement;
    const paths = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.shell__sidebar .nav__link'),
    ).map((a) => a.getAttribute('href') ?? '');

    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      await harness.navigateByUrl(path);
      harness.detectChanges();
      // Read the current root: /focus swaps the whole layout (no shell).
      const current = harness.routeNativeElement as HTMLElement;
      const heading = current.querySelector('main h1')?.textContent;
      expect(heading, path).toBeTruthy();
      expect(heading, path).not.toContain('Página não encontrada');
    }
  });
});
