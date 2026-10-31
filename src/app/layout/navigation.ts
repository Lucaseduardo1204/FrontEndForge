import {
  LucideAward,
  LucideBug,
  LucideFlaskConical,
  LucideFocus,
  LucideFolderKanban,
  LucideIcon,
  LucideLayoutDashboard,
  LucideLibrary,
  LucideMap,
  LucideRepeat,
  LucideSettings,
  LucideTarget,
  LucideUserRound,
} from '@lucide/angular';

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  /** `planned` items open an honest "Planejado" page instead of a working feature. */
  readonly status: 'available' | 'planned';
}

export interface NavSection {
  readonly label: string;
  readonly items: readonly NavItem[];
}

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    label: 'Estudo',
    items: [
      {
        path: '/',
        label: 'Central de comando',
        icon: LucideLayoutDashboard,
        status: 'available',
      },
      { path: '/academy', label: 'Academia', icon: LucideMap, status: 'available' },
      { path: '/review', label: 'Revisões', icon: LucideRepeat, status: 'available' },
      { path: '/lab', label: 'Laboratório', icon: LucideFlaskConical, status: 'available' },
      { path: '/focus', label: 'Modo foco', icon: LucideFocus, status: 'available' },
    ],
  },
  {
    label: 'Prática',
    items: [
      { path: '/missions', label: 'Missões', icon: LucideTarget, status: 'available' },
      { path: '/projects', label: 'Projetos', icon: LucideFolderKanban, status: 'available' },
      { path: '/bugs', label: 'Bestiário de bugs', icon: LucideBug, status: 'available' },
    ],
  },
  {
    label: 'Consulta',
    items: [
      { path: '/library', label: 'Biblioteca', icon: LucideLibrary, status: 'available' },
      { path: '/achievements', label: 'Conquistas e XP', icon: LucideAward, status: 'available' },
      { path: '/profile', label: 'Competências', icon: LucideUserRound, status: 'available' },
      { path: '/settings', label: 'Configurações', icon: LucideSettings, status: 'available' },
    ],
  },
];
