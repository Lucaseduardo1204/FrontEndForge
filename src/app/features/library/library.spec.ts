import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';

describe('library', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
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
    harness = await RouterTestingHarness.create();
  });

  const main = () => (harness.routeNativeElement as HTMLElement).querySelector('main')!;
  const text = () => main().textContent?.replace(/\s+/g, ' ') ?? '';

  it('searches and filters the entries', async () => {
    await harness.navigateByUrl('/library');
    harness.detectChanges();
    const total = main().querySelectorAll('ul.entries > li').length;
    expect(total).toBeGreaterThan(10);

    const search = main().querySelector<HTMLInputElement>('#library-search')!;
    search.value = 'microtarefa';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(main().querySelectorAll('ul.entries > li').length).toBe(1);
    expect(text()).toContain('Event loop');

    main().querySelector<HTMLButtonElement>('.link-button')!.click();
    harness.detectChanges();
    const technology = main().querySelector<HTMLSelectElement>('#library-technology')!;
    technology.value = 'tools';
    technology.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(text()).toContain('2 entradas');
  });

  it('shows an entry with a table, safe external links and links to practice', async () => {
    await harness.navigateByUrl('/library/lib-script-loading');
    harness.detectChanges();

    expect(main().querySelector('table caption')?.textContent).toContain('Comparação');
    expect(main().querySelectorAll('tbody th[scope=row]').length).toBe(4);
    const external = main().querySelector<HTMLAnchorElement>('a[target=_blank]')!;
    expect(external.href).toMatch(/^https:\/\/developer\.mozilla\.org\//);
    expect(external.rel).toBe('noopener noreferrer');
    expect(main().querySelector('a[href="/lessons/web-browser-01"]')?.textContent).toContain(
      'Como o navegador interpreta',
    );
  });

  it('handles unknown entries', async () => {
    await harness.navigateByUrl('/library/nada');
    harness.detectChanges();

    expect(main().querySelector('h1')?.textContent).toContain('Entrada não encontrada');
  });
});
