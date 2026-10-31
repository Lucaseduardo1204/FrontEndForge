import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAward, LucideCalendarCheck, LucideLock } from '@lucide/angular';
import { GamificationService } from '../../../core/gamification/gamification.service';
import { XP_RULES } from '../../../core/gamification/xp';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { LevelProgress } from '../level-progress/level-progress';

@Component({
  selector: 'app-achievements-page',
  imports: [DatePipe, RouterLink, LevelProgress, LucideAward, LucideCalendarCheck, LucideLock],
  templateUrl: './achievements-page.html',
  styleUrl: './achievements-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsPage {
  private readonly gamification = inject(GamificationService);

  protected readonly level = this.gamification.level;
  protected readonly streak = this.gamification.streak;
  protected readonly achievements = this.gamification.achievements;
  protected readonly unlockedCount = computed(
    () => this.achievements().filter((a) => a.unlockedAt).length,
  );
  protected readonly history = computed(() =>
    [...this.gamification.xpEntries()].reverse().slice(0, 30),
  );

  protected readonly rules = [
    ...(['introductory', 'intermediate', 'advanced'] as const).map((difficulty) => ({
      activity: `Exercício ${DIFFICULTY_LABELS[difficulty].toLowerCase()} resolvido pela primeira vez`,
      xp: `${XP_RULES.objective[difficulty]} (laboratório: ${XP_RULES.code[difficulty]})`,
    })),
    { activity: 'Lição concluída pela primeira vez', xp: String(XP_RULES.lesson) },
    { activity: 'Projeto concluído pela primeira vez', xp: String(XP_RULES.project) },
    {
      activity: 'Missão cumprida (todas as tarefas)',
      xp: `${XP_RULES.mission} além do XP das tarefas`,
    },
    {
      activity: 'Revisão espaçada',
      xp: `${XP_RULES.reviewCorrect} se acertar, ${XP_RULES.reviewWrong} se errar`,
    },
    { activity: 'Resolver de novo algo já resolvido', xp: '0' },
    { activity: 'Pedir a solução antes de tentar', xp: 'metade do valor do exercício' },
  ];
}
