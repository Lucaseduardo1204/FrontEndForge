import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { NavSection } from '../navigation';

@Component({
  selector: 'app-sidebar-nav',
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './sidebar-nav.html',
  styleUrl: './sidebar-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNav {
  readonly sections = input.required<readonly NavSection[]>();
  /** Prefix for heading ids; the nav is rendered twice (sidebar and mobile drawer). */
  readonly navId = input.required<string>();
  readonly navigated = output();
}
