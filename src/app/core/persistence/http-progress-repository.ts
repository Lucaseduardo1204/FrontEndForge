import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Progress } from '../models/progress.models';
import { ProgressRepository, SignInRequiredError } from './progress-repository';
import { parseProgressJson } from './progress-schema';

export const PROGRESS_API_URL = new InjectionToken<string>('PROGRESS_API_URL');

/** The progress changed elsewhere (another tab or device) since it was loaded here. */
export class ProgressConflictError extends Error {
  constructor(options?: ErrorOptions) {
    super(
      'O progresso foi alterado em outro lugar depois de carregado aqui. Recarregue a página para continuar de onde ele está.',
      options,
    );
    this.name = 'ProgressConflictError';
  }
}

/**
 * Progress stored by the backend (`backend/`, D-070). The document received is validated again
 * with the same rules as the local one: the client does not trust the server blindly either.
 * The ETag of the last read or write goes back as If-Match, so a stale tab cannot overwrite
 * newer progress (the server answers 412).
 */
@Injectable()
export class HttpProgressRepository extends ProgressRepository {
  private readonly http = inject(HttpClient);
  private readonly url = inject(PROGRESS_API_URL);
  private etag: string | null = null;

  async load(): Promise<Progress | null> {
    const response = await this.request(() =>
      this.http.get(this.url, { observe: 'response', responseType: 'text' }),
    );
    this.etag = response.headers.get('ETag');
    return response.status === 204 || !response.body ? null : parseProgressJson(response.body);
  }

  async save(progress: Progress): Promise<void> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.etag) headers = headers.set('If-Match', this.etag);
    const response = await this.request(() =>
      this.http.put(this.url, JSON.stringify(progress), {
        headers,
        observe: 'response',
        responseType: 'text',
      }),
    );
    this.etag = response.headers.get('ETag') ?? this.etag;
  }

  async clear(): Promise<void> {
    await this.request(() => this.http.delete(this.url, { observe: 'response' }));
    this.etag = null;
  }

  private async request<T>(send: () => import('rxjs').Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(send());
    } catch (error) {
      if (!(error instanceof HttpErrorResponse)) throw error;
      if (error.status === 401) throw new SignInRequiredError({ cause: error });
      if (error.status === 412) throw new ProgressConflictError({ cause: error });
      if (error.status === 0) {
        throw new Error('Sem conexão com o servidor de progresso. Verifique se ele está rodando.', {
          cause: error,
        });
      }
      throw new Error(`O servidor de progresso recusou a operação (HTTP ${error.status}).`, {
        cause: error,
      });
    }
  }
}
