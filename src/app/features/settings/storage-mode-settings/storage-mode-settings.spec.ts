import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { KeyValueStorage } from '../../../core/persistence/key-value-storage';
import { provideProgressStorage } from '../../../core/persistence/progress-storage.providers';
import { RELOAD_PAGE, STORAGE_MODE_KEY } from '../../../core/persistence/storage-mode';
import { StorageModeSettings } from './storage-mode-settings';

/** This jsdom has no <dialog> methods; a minimal version that fires `close` like browsers do. */
function installDialog(): void {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

describe('StorageModeSettings', () => {
  let saved: Record<string, string>;
  let reloads: number;
  let http: HttpTestingController;

  beforeAll(installDialog);

  beforeEach(() => {
    saved = {};
    reloads = 0;
    TestBed.configureTestingModule({
      providers: [
        ...provideProgressStorage(),
        provideHttpClientTesting(),
        {
          provide: KeyValueStorage,
          useValue: {
            read: (k: string) => saved[k] ?? null,
            write: (k: string, v: string) => ((saved[k] = v), true),
            remove: (k: string) => delete saved[k],
          },
        },
        { provide: RELOAD_PAGE, useValue: () => reloads++ },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function render(backend: 'here' | 'absent') {
    const fixture = TestBed.createComponent(StorageModeSettings);
    fixture.detectChanges();
    const probe = http.expectOne('/api/auth/me');
    if (backend === 'here') probe.flush(null, { status: 401, statusText: 'Unauthorized' });
    else probe.flush('<!doctype html>', { headers: { 'Content-Type': 'text/html' } });
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const [local, server] = Array.from(
      el.querySelectorAll<HTMLInputElement>('input[name="storage-mode"]'),
    );
    return { fixture, el, local, server, dialog: el.querySelector('dialog')! };
  }

  it('without a backend, the server option is disabled and says why', async () => {
    const { el, local, server } = await render('absent');
    expect(local.checked).toBe(true);
    expect(server.disabled).toBe(true);
    expect(server.getAttribute('aria-describedby')).toBe('storage-mode-server-hint');
    expect(el.querySelector('#storage-mode-server-hint')?.textContent).toContain(
      'não tem o servidor',
    );
  });

  it('with a backend, picking the server asks first; cancelling keeps local', async () => {
    const { fixture, local, server, dialog } = await render('here');
    expect(server.disabled).toBe(false);

    server.click();
    await fixture.whenStable();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.textContent).toContain('não é levado junto');

    dialog.querySelector<HTMLButtonElement>('button')!.click(); // Cancelar
    await fixture.whenStable();
    expect(local.checked).toBe(true);
    expect(server.checked).toBe(false);
    expect(saved[STORAGE_MODE_KEY]).toBeUndefined();
    expect(reloads).toBe(0);
  });

  it('confirming saves the choice and reloads', async () => {
    const { fixture, server, dialog } = await render('here');
    server.click();
    await fixture.whenStable();
    dialog.querySelectorAll<HTMLButtonElement>('button')[1].click(); // Trocar e recarregar
    expect(saved[STORAGE_MODE_KEY]).toBe('server');
    expect(reloads).toBe(1);
  });
});
