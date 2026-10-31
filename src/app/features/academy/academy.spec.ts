import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CONTENT, ContentCatalog } from '../../../content';
import { CONTENT_CATALOG } from '../../core/content/content.service';
import { routes } from '../../app.routes';
import { Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { createEmptyProgress } from '../../core/persistence/progress-schema';
import { completeLesson, startLesson } from '../../core/progress/progress-updates';
import { ProgressService } from '../../core/progress/progress.service';

describe('academy', () => {
  let harness: RouterTestingHarness;

  async function setup(saved: Progress | null, catalog: ContentCatalog = CONTENT): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: CONTENT_CATALOG, useValue: catalog },
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
        {
          provide: ProgressRepository,
          useValue: {
            load: async () => saved,
            save: async () => undefined,
            clear: async () => undefined,
          },
        },
      ],
    });
    await TestBed.inject(ProgressService).load();
    harness = await RouterTestingHarness.create();
  }

  async function open(url: string): Promise<HTMLElement> {
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return (harness.routeNativeElement as HTMLElement).querySelector('main') as HTMLElement;
  }

  const now = new Date(2026, 9, 29);

  it('shows all 14 phases, with phase 0 available and unpublished phases planned', async () => {
    await setup(null);
    const main = await open('/academy');
    const items = main.querySelectorAll('ol.map > li');

    expect(items).toHaveLength(14);
    expect(items[0].textContent).toContain('Como a web funciona');
    expect(items[0].textContent).toContain('Disponível');
    const phase0Lessons = CONTENT.modules
      .filter((m) => m.phaseId === 'phase-00-web')
      .reduce((n, m) => n + m.lessonIds.length, 0);
    expect(items[0].textContent).toContain(
      `0 de ${phase0Lessons} ${phase0Lessons === 1 ? 'lição concluída' : 'lições concluídas'}`,
    );
    // Every phase of the real catalog has content now; the planned state is tested below.
    expect(items[13].textContent).toContain('Projeto final (capstone)');
    expect(main.textContent).not.toContain('Conteúdo desta fase ainda não publicado');
  });

  it('filters phases by topic and says which topics matched', async () => {
    await setup(null);
    const main = await open('/academy');
    const input = main.querySelector<HTMLInputElement>('#phase-search')!;

    input.value = 'narrowing';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();

    const items = main.querySelectorAll('ol.map > li');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('TypeScript');
    expect(items[0].textContent).toContain('Tópicos encontrados: Narrowing');
    expect(main.querySelector('#search-count')?.textContent).toContain('1 fase encontrada');
  });

  it('reflects saved progress on the map', async () => {
    await setup(startLesson(createEmptyProgress(now), 'web-browser-01', now));
    const inProgress = await open('/academy');

    expect(inProgress.querySelector('ol.map > li')?.textContent).toContain('Em andamento');
  });

  it('details a phase: introduction, topics, module with lesson link and planned project', async () => {
    await setup(completeLesson(createEmptyProgress(now), 'web-browser-01', now));
    const main = await open('/academy/phases/phase-00-web');

    expect(main.querySelector('h1')?.textContent).toContain('Como a web funciona');
    expect(main.textContent).toContain('Concluído');
    expect(main.textContent).toContain('Introdução ao Git');
    const lessonLink = main.querySelector<HTMLAnchorElement>('a[href="/lessons/web-browser-01"]');
    expect(lessonLink?.textContent).toContain('Como o navegador interpreta');
    expect(main.textContent).toContain('1 de 1 concluídas');
    expect(main.textContent).toContain('Projeto da fase');
  });

  it('shows a planned phase honestly', async () => {
    // Every real phase has content; a catalog with phase 13 unpublished keeps the state tested.
    const catalog: ContentCatalog = {
      ...CONTENT,
      phases: CONTENT.phases.map((p) =>
        p.id === 'phase-13-capstone' ? { ...p, moduleIds: [], projectId: undefined } : p,
      ),
    };
    await setup(null, catalog);
    const planned = catalog.phases.find((p) => p.moduleIds.length === 0)!;
    const main = await open(`/academy/phases/${planned.id}`);

    expect(main.textContent).toContain('Conteúdo em produção');
    expect(main.textContent).toContain(planned.topics[0]);
    for (const prerequisite of planned.prerequisitePhaseIds) {
      expect(main.querySelector(`a[href="/academy/phases/${prerequisite}"]`)).not.toBeNull();
    }
  });

  it('handles unknown phases', async () => {
    await setup(null);
    const main = await open('/academy/phases/nope');

    expect(main.querySelector('h1')?.textContent).toContain('Fase não encontrada');
  });
});
