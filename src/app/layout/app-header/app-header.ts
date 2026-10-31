import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideMenu, LucideMoon, LucideSun } from '@lucide/angular';
import { Theme } from '../../core/theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [LucideMenu, LucideMoon, LucideSun],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  readonly pageTitle = input.required<string>();
  readonly theme = input.required<Theme>();
  readonly menuExpanded = input.required<boolean>();

  readonly menuRequested = output();
  readonly themeToggled = output();
}
