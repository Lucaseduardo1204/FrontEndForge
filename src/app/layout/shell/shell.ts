import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideHammer, LucideX } from '@lucide/angular';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ThemeService } from '../../core/theme/theme.service';
import { AppHeader } from '../app-header/app-header';
import { NAV_SECTIONS } from '../navigation';
import { SidebarNav } from '../sidebar-nav/sidebar-nav';

@Component({
  selector: 'app-shell',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    AppHeader,
    SidebarNav,
    LucideHammer,
    LucideX,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly themeService = inject(ThemeService);
  private readonly titleStrategy = inject(AppTitleStrategy);

  protected readonly sections = NAV_SECTIONS;
  protected readonly theme = this.themeService.theme;
  protected readonly pageTitle = this.titleStrategy.pageTitle;
  protected readonly menuOpen = signal(false);

  private readonly drawer = viewChild.required<ElementRef<HTMLDialogElement>>('drawer');
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected openMenu(): void {
    this.menuOpen.set(true);
    this.drawer().nativeElement.showModal();
  }

  /** The native dialog restores focus to the menu button when it closes. */
  protected closeMenu(): void {
    this.drawer().nativeElement.close();
  }

  protected onDrawerClick(event: MouseEvent): void {
    // Clicks on the backdrop target the <dialog> itself; the panel content is a child element.
    if (event.target === this.drawer().nativeElement) this.closeMenu();
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }

  protected skipToContent(): void {
    this.main().nativeElement.focus();
  }
}
