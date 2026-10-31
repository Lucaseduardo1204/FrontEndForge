import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { transform } from 'sucrase';
import { SECURITY_DATA_01_EXERCISES } from './exercises/security-data-01.exercises';
import { SECURITY_SESSION_01_EXERCISES } from './exercises/security-session-01.exercises';
import { SECURITY_XSS_01_EXERCISES } from './exercises/security-xss-01.exercises';
import { LOG_MASK_TS } from './lessons/security-data-01';
import { SESSION_COOKIE_HTTP, XSRF_CONFIG_TS } from './lessons/security-session-01';
import {
  ATTACK_TEXT,
  BYPASS_VULNERABLE_TS,
  SAFE_TEMPLATE_HTML,
  SAFE_URL_TS,
} from './lessons/security-xss-01';
import { CodeExercise } from '../app/core/models/content.models';

/**
 * Claims of the phase 9 lessons, executed with the Angular of this project. Browser-only
 * claims (HttpOnly, CORS, preflight) were measured in a real Chromium (D-055).
 */

const solution = (exercises: readonly { id: string }[], id: string) => {
  const exercise = exercises.find((e) => e.id === id) as CodeExercise;
  const block = exercise.solution.find((b) => b.type === 'code');
  return block && block.type === 'code' ? block.code : '';
};

describe('XSS lesson: Angular sanitization', () => {
  @Component({
    selector: 'app-comentario',
    template: `<p id="interp">{{ texto }}</p>
      <div id="inner" [innerHTML]="texto"></div>
      <a id="href" [href]="site">Site do autor</a>
      <div id="bypass" [innerHTML]="confiavel"></div>`,
  })
  class Comentario {
    texto = ATTACK_TEXT;
    site = 'javascript:alert(1)';
    confiavel = inject(DomSanitizer).bypassSecurityTrustHtml(ATTACK_TEXT);
  }

  async function render() {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(Comentario);
    await fixture.whenStable();
    const warnings = warn.mock.calls.map((c) => String(c[0])); // read before mockRestore clears it
    warn.mockRestore();
    return { el: fixture.nativeElement as HTMLElement, warnings };
  }

  it('interpolation shows the attack as literal text', async () => {
    const { el } = await render();

    expect(el.querySelector('#interp')!.textContent).toBe(ATTACK_TEXT);
    expect(el.querySelector('#interp img')).toBeNull();
  });

  it('[innerHTML] keeps <b> and removes onerror and <script>, with a console warning', async () => {
    const { el, warnings } = await render();

    expect(el.querySelector('#inner')!.innerHTML).toBe('<img src="x"><b>negrito</b>');
    expect(warnings.some((w) => w.includes('sanitizing HTML stripped some content'))).toBe(true);
  });

  it('xss-01-href: a javascript: URL in [href] gets the unsafe: prefix', async () => {
    const { el } = await render();

    expect(el.querySelector('#href')!.getAttribute('href')).toBe('unsafe:javascript:alert(1)');
    const exercise = SECURITY_XSS_01_EXERCISES.find((e) => e.id === 'xss-01-href')!;
    expect(exercise.kind === 'predict-output' && exercise.acceptedAnswers).toEqual([
      'unsafe:javascript:alert(1)',
    ]);
  });

  it('bypassSecurityTrustHtml lets everything through, onerror and script included', async () => {
    const { el } = await render();
    const html = el.querySelector('#bypass')!.innerHTML;

    expect(html).toContain('onerror="alert(1)"');
    expect(html).toContain('<script>');
  });

  it('the lesson shows these exact bindings and the bypass', () => {
    expect(SAFE_TEMPLATE_HTML).toContain('<p>{{ comentario.texto }}</p>');
    expect(SAFE_TEMPLATE_HTML).toContain('[innerHTML]="comentario.textoFormatado"');
    expect(SAFE_TEMPLATE_HTML).toContain('[href]="comentario.site"');
    expect(BYPASS_VULNERABLE_TS).toContain('bypassSecurityTrustHtml(');
  });
});

describe('XSS lesson: safe URLs', () => {
  it('the browser URL parser removes tabs, so "java\\tscript:" is javascript:', () => {
    expect(new URL('java\tscript:alert(1)').protocol).toBe('javascript:');
    expect(new URL('  JavaScript:alert(1)'.trim()).protocol).toBe('javascript:');
  });

  it('the urlSegura of the lesson behaves like the lab solution', () => {
    const fromLesson = new Function(
      `${transform(SAFE_URL_TS.replace('export function', 'function'), { transforms: ['typescript'] }).code}\nreturn urlSegura;`,
    )() as (s: string) => string | null;
    const fromLab = new Function(
      `${solution(SECURITY_XSS_01_EXERCISES, 'lab-js-safe-url')}\nreturn urlSegura;`,
    )() as (s: string) => string | null;

    for (const input of [
      'https://ana.dev',
      ' /perfil/ana ',
      'mailto:ana@exemplo.com',
      'javascript:alert(1)',
      'java\tscript:alert(1)',
      'data:text/html,x',
      'http://',
    ]) {
      expect(fromLesson(input), input).toBe(fromLab(input));
    }
  });
});

describe('session lesson: HttpClient XSRF header', () => {
  let http: HttpClient;
  let server: HttpTestingController;

  beforeEach(() => {
    document.cookie = 'XSRF-TOKEN=abc123; path=/';
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    server = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    server.verify();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  function header(method: string, url: string): string | null {
    http.request(method, url, { body: {} }).subscribe();
    const req = server.expectOne(url);
    const value = req.request.headers.get('X-XSRF-TOKEN');
    req.flush({});
    return value;
  }

  it('is sent on POST, PUT, PATCH and DELETE to relative URLs, not on GET', () => {
    expect(header('POST', '/api/transferencias')).toBe('abc123');
    expect(header('PUT', '/api/contas/1')).toBe('abc123');
    expect(header('PATCH', '/api/contas/1')).toBe('abc123');
    expect(header('DELETE', '/api/contas/1')).toBe('abc123');
    expect(header('GET', '/api/contas')).toBeNull();
  });

  it('session-01-xsrf-url: not sent to absolute URLs, even of the same site', () => {
    expect(header('POST', `${location.origin}/api/transferencias`)).toBeNull();
    expect(header('POST', 'https://outro-site.com/api')).toBeNull();
    const exercise = SECURITY_SESSION_01_EXERCISES.find((e) => e.id === 'session-01-xsrf-url')!;
    expect(exercise.kind === 'predict-output' && exercise.acceptedAnswers).toEqual(['abc123 null']);
  });

  it('the lesson config says the same', () => {
    expect(XSRF_CONFIG_TS).toContain('providers: [provideHttpClient()],');
    expect(XSRF_CONFIG_TS).toContain(
      "this.http.post('/api/transferencias', dados); // leva X-XSRF-TOKEN",
    );
  });
});

describe('session and data lessons: consistency with the lab solutions', () => {
  it('the session cookie shown in the lesson passes the cookie reviewer', () => {
    const revisar = new Function(
      `${solution(SECURITY_SESSION_01_EXERCISES, 'lab-js-cookie-review')}\nreturn revisarCookie;`,
    )() as (s: string) => { nome: string; problemas: string[] };

    expect(revisar(SESSION_COOKIE_HTTP.replace('Set-Cookie: ', ''))).toEqual({
      nome: '__Host-sessao',
      problemas: [],
    });
  });

  it('the masked log shown in the lesson is what the lab solution produces', () => {
    const mascarar = new Function(
      `${solution(SECURITY_DATA_01_EXERCISES, 'lab-js-mask-sensitive')}\nreturn mascararDadosSensiveis;`,
    )() as (v: unknown) => unknown;

    expect(mascarar({ nome: 'Ana', senha: '123', cartao: { numero: '4111' } })).toEqual({
      nome: 'Ana',
      senha: '[removido]',
      cartao: '[removido]',
    });
    expect(LOG_MASK_TS).toContain("// { nome: 'Ana', senha: '[removido]', cartao: '[removido]' }");
  });
});
