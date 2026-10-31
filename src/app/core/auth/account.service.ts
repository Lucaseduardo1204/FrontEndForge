import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, InjectionToken, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProgressService } from '../progress/progress.service';

export const AUTH_API_URL = new InjectionToken<string>('AUTH_API_URL');

export interface SignedInAccount {
  readonly email: string;
}

/**
 * Account on the backend (server mode only; see provideProgressStorage). The session lives
 * in an HttpOnly cookie that JavaScript cannot read; the browser sends it, and HttpClient adds the
 * X-XSRF-TOKEN header to writes. After signing in, out or up, progress is loaded again, so what is
 * on screen always belongs to the account that is signed in.
 */
@Injectable()
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly progress = inject(ProgressService);
  private readonly url = inject(AUTH_API_URL);

  readonly account = signal<SignedInAccount | null>(null);
  /** Set when the server could not be reached to check the session. */
  readonly connectionError = signal<string | null>(null);

  async refresh(): Promise<void> {
    try {
      const me = await firstValueFrom(this.http.get<SignedInAccount>(`${this.url}/me`));
      this.account.set({ email: me.email });
      this.connectionError.set(null);
    } catch (error) {
      this.account.set(null);
      const unauthorized = error instanceof HttpErrorResponse && error.status === 401;
      this.connectionError.set(unauthorized ? null : describe(error, 'verificar a sua conta'));
    }
  }

  signIn(email: string, password: string): Promise<void> {
    return this.send('login', email, password, 'entrar');
  }

  register(email: string, password: string): Promise<void> {
    return this.send('register', email, password, 'criar a conta');
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.url}/logout`, null));
    } catch (error) {
      throw new Error(describe(error, 'sair'), { cause: error });
    }
    this.account.set(null);
    await this.progress.load(); // clears the previous account's progress from the screen
  }

  private async send(path: string, email: string, password: string, action: string): Promise<void> {
    let me: SignedInAccount;
    try {
      me = await firstValueFrom(
        this.http.post<SignedInAccount>(`${this.url}/${path}`, { email, password }),
      );
    } catch (error) {
      throw new Error(describe(error, action), { cause: error });
    }
    this.account.set({ email: me.email });
    this.connectionError.set(null);
    await this.progress.load();
  }
}

/** The server's own message when it sent one (it is written for the student), else a fallback. */
function describe(error: unknown, action: string): string {
  if (error instanceof HttpErrorResponse) {
    const message = (error.error as { erro?: unknown } | null)?.erro;
    if (typeof message === 'string') return message;
    if (error.status === 0) return 'Sem conexão com o servidor. Verifique se ele está rodando.';
    return `Não foi possível ${action} (HTTP ${error.status}).`;
  }
  return `Não foi possível ${action}.`;
}
