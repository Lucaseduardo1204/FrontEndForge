import { computed, inject, Injectable } from '@angular/core';
import { ContentService } from '../content/content.service';
import { Achievement } from '../models/content.models';
import { IsoDateTime } from '../models/progress.models';
import { ProgressService } from '../progress/progress.service';
import { toLocalDay } from '../progress/progress-updates';
import { achievementStates } from './achievement-rules';
import { streakInfo } from './streak';
import { levelFor, totalXp, XpEntry, xpEntries } from './xp';

export interface UnlockedAchievement {
  readonly achievement: Achievement;
  readonly unlockedAt: IsoDateTime | null;
}

/** What the student earned with one action, to show right after it. */
export interface Reward {
  readonly xp: readonly XpEntry[];
  readonly achievements: readonly Achievement[];
}

export interface RewardSnapshot {
  readonly xpIds: ReadonlySet<string>;
  readonly unlockedIds: ReadonlySet<string>;
}

/** XP, level, streak and achievements, all derived from the saved progress. */
@Injectable({ providedIn: 'root' })
export class GamificationService {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  readonly xpEntries = computed(() => xpEntries(this.catalog, this.progressService.progress()));
  readonly level = computed(() => levelFor(totalXp(this.xpEntries())));
  readonly streak = computed(() =>
    streakInfo(this.progressService.progress().studyDays, toLocalDay(new Date())),
  );
  readonly achievements = computed<UnlockedAchievement[]>(() => {
    const states = achievementStates(this.catalog, this.progressService.progress());
    return this.catalog.achievements.map((achievement) => ({
      achievement,
      unlockedAt: states.find((s) => s.id === achievement.id)?.unlockedAt ?? null,
    }));
  });

  snapshot(): RewardSnapshot {
    return {
      xpIds: new Set(this.xpEntries().map((e) => e.id)),
      unlockedIds: new Set(
        this.achievements()
          .filter((a) => a.unlockedAt)
          .map((a) => a.achievement.id),
      ),
    };
  }

  /** XP and achievements gained since `before` (null when nothing was gained). */
  rewardSince(before: RewardSnapshot): Reward | null {
    const xp = this.xpEntries().filter((e) => !before.xpIds.has(e.id));
    const achievements = this.achievements()
      .filter((a) => a.unlockedAt && !before.unlockedIds.has(a.achievement.id))
      .map((a) => a.achievement);
    return xp.length > 0 || achievements.length > 0 ? { xp, achievements } : null;
  }
}
