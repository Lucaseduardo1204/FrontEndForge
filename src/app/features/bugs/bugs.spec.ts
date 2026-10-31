import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { ProgressService } from '../../core/progress/progress.service';
import { CONTENT } from '../../../content';

describe('bug bestiary', () => {
  let stored: Progress | null;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    stored = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
        {
          provide: ProgressRepository,
          useValue: {
            load: async () => stored,
            save: async (p: Progress) => void (stored = p),
            clear: async () => undefined,
          },
        },
      ],
    });
    await TestBed.inject(ProgressService).load();
    harness = await RouterTestingHarness.create();
  });

  const main = () => (harness.routeNativeElement as HTMLElement).querySelector('main')!;
  const text = () => main().textContent?.replace(/\s+/g, ' ') ?? '';
  const button = (label: string) =>
    Array.from(main().querySelectorAll('button')).find((b) => b.textContent?.includes(label))!;

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    harness.detectChanges();
  }

  it('lists the entries and filters them by technology', async () => {
    await harness.navigateByUrl('/bugs');
    harness.detectChanges();
    expect(main().querySelectorAll('ul.bugs > li').length).toBe(CONTENT.bugs.length);

    button('Angular').click();
    await settle();

    expect(main().querySelectorAll('ul.bugs > li').length).toBe(
      CONTENT.bugs.filter((b) => b.technology === 'angular').length,
    );
    expect(button('Angular').getAttribute('aria-pressed')).toBe('true');
    expect(text()).toContain('A tela não atualiza depois do push');
  });

  it('keeps the cause hidden until the diagnosis is attempted, even when wrong', async () => {
    await harness.navigateByUrl('/bugs/bug-async-foreach');
    await settle();
    expect(text()).toContain('forEach(async');
    expect(text()).not.toContain('Promise.all');

    const input = main().querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = '30';
    input.dispatchEvent(new Event('input'));
    await settle();
    button('Verificar resposta').click();
    await settle();

    expect(text()).toContain('forEach não espera Promises');
    expect(text()).toContain('Promise.all');
    expect(text()).toContain('no-misused-promises');
  });

  it('can reveal the cause on explicit request', async () => {
    await harness.navigateByUrl('/bugs/bug-div-button');
    await settle();

    button('Ver a causa sem diagnosticar').click();
    await settle();

    expect(text()).toContain('Uma <div> não é um controle');
    expect(stored).toBeNull(); // nothing was recorded as an attempt
  });
});
