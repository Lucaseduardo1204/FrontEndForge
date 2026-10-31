import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { ProgressService } from '../../core/progress/progress.service';

registerLocaleData(localePt);

describe('focus mode', () => {
  let stored: Progress | null;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    stored = null;
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' },
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

  const root = () => harness.routeNativeElement as HTMLElement;
  const text = () => root().textContent?.replace(/\s+/g, ' ') ?? '';
  const button = (label: string) =>
    Array.from(root().querySelectorAll('button')).find((b) => b.textContent?.includes(label))!;

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 10));
    harness.detectChanges();
  }

  it('uses a reduced layout without the sidebar', async () => {
    await harness.navigateByUrl('/focus');
    await settle();

    expect(root().querySelector('.shell__sidebar')).toBeNull();
    expect(root().querySelector('a[href="/"]')?.textContent).toContain('Sair do modo foco');
  });

  it('validates the objective and previews a plan that follows the chosen time', async () => {
    await harness.navigateByUrl('/focus');
    await settle();
    expect(text()).toContain('Plano sugerido');
    expect(text()).toContain('Revisão: nenhum conceito com revisão vencida hoje.');

    const objective = root().querySelector<HTMLInputElement>('#objective')!;
    objective.value = 'x'.repeat(141);
    objective.dispatchEvent(new Event('input'));
    button('Começar a sessão').click();
    await settle();

    expect(text()).toContain('Use no máximo 140 caracteres');
    expect(objective.getAttribute('aria-invalid')).toBe('true');
    expect(stored?.sessions ?? []).toEqual([]);
  });

  it('runs a whole session and summarizes demonstrated learning', async () => {
    await harness.navigateByUrl('/focus');
    await settle();
    const objective = root().querySelector<HTMLInputElement>('#objective')!;
    objective.value = 'Entender o layout responsivo';
    objective.dispatchEvent(new Event('input'));
    button('Começar a sessão').click();
    await settle();

    expect(text()).toContain('Entender o layout responsivo');
    expect(text()).toContain('0 de 3 blocos concluídos');
    // The first block is the lesson, embedded in the session.
    expect(root().querySelector('app-lesson-page h1')?.textContent).toContain('Como o navegador');

    // Practice block: answered inside the session.
    Array.from(root().querySelectorAll<HTMLButtonElement>('.plan__item'))[1].click();
    await settle();
    for (const label of ['960px', 'flex-shrink: 0', 'largura fixa de 300px']) {
      Array.from(root().querySelectorAll('label'))
        .find((l) => l.textContent?.includes(label))!
        .querySelector('input')!
        .click();
      await settle();
    }
    button('Verificar resposta').click();
    await settle();
    expect(text()).toContain('Resposta correta');
    button('Concluir este bloco').click();
    await settle();
    expect(text()).toContain('1 de 3 blocos concluídos');

    // A pause hides the activity.
    button('Fazer uma pausa').click();
    await settle();
    expect(text()).toContain('Pausa');
    expect(root().querySelector('app-exercise-player')).toBeNull();
    button('Retomar a sessão').click();
    await settle();

    button('Encerrar a sessão agora').click();
    await settle();
    await settle();

    expect(text()).toContain('Resumo da sessão');
    expect(text()).toContain('Objetivo: Entender o layout responsivo');
    const first = root().querySelector('.stats__item');
    expect(first?.querySelector('dt')?.textContent).toContain(
      'Exercícios resolvidos pela primeira vez',
    );
    expect(first?.querySelector('dd')?.textContent?.trim()).toBe('1');
    expect(text()).toContain('Por que os cartões vazam em telas pequenas?');
    expect(stored?.sessions[0].endedAt).toBeDefined();

    const notes = root().querySelector<HTMLTextAreaElement>('#session-notes')!;
    notes.value = 'Três larguras rígidas somadas causam o vazamento.';
    notes.dispatchEvent(new Event('input'));
    await settle();
    button('Salvar anotações').click();
    await settle();
    expect(stored?.sessions[0].notes).toBe('Três larguras rígidas somadas causam o vazamento.');
    expect(text()).toContain('Anotações salvas');
  });

  it('is honest when nothing was practiced', async () => {
    await harness.navigateByUrl('/focus');
    await settle();
    button('Começar a sessão').click();
    await settle();
    button('Encerrar a sessão agora').click();
    await settle();
    await settle();

    expect(text()).toContain('Nenhuma resposta ou lição concluída foi registrada nesta sessão');
  });
});
