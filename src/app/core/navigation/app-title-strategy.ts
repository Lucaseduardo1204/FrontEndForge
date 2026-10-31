import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const APP_NAME = 'Frontend Forge';

/** Sets the document title from the route `title` and exposes it for the page header. */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  readonly pageTitle = signal('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) ?? '';
    this.pageTitle.set(pageTitle);
    this.title.setTitle(pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME);
  }
}
