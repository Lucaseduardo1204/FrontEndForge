import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { WeekActivity } from '../../../core/learning/weekly-activity';

const HEIGHT = 220;
const PAD = { top: 24, right: 8, bottom: 28, left: 32 };
const GAP = 2; // surface gap between stacked segments
const RADIUS = 4; // rounded data end (top only)

/** Top-rounded bar segment, square at the bottom (anchored to the baseline). */
function roundedTop(x: number, y: number, w: number, h: number): string {
  const r = Math.min(RADIUS, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function shortDate(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}

/**
 * Right and wrong answers per week as stacked bars. Hover or keyboard focus on a week shows
 * its numbers; the same data is available as a table.
 */
@Component({
  selector: 'app-activity-chart',
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityChart {
  readonly weeks = input.required<readonly WeekActivity[]>();

  /**
   * The viewBox follows the real width (1 unit = 1 px), so text keeps its size instead of
   * scaling with the chart (huge on desktop, unreadable on phones).
   */
  protected readonly width = signal(600);
  protected readonly height = HEIGHT;
  protected readonly baseline = HEIGHT - PAD.bottom;
  protected readonly left = PAD.left;
  protected readonly right = computed(() => this.width() - PAD.right);
  protected readonly active = signal<number | null>(null);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) =>
        this.width.set(Math.max(280, Math.round(entry.contentRect.width))),
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected readonly hasData = computed(() =>
    this.weeks().some((w) => w.correct + w.incorrect > 0),
  );

  protected readonly scaleMax = computed(() => {
    const max = Math.max(1, ...this.weeks().map((w) => w.correct + w.incorrect));
    const step = max <= 5 ? 1 : max <= 20 ? 5 : 10;
    return Math.ceil(max / step) * step;
  });

  protected readonly gridlines = computed(() => {
    const max = this.scaleMax();
    // Answers are counts: a middle line only when it is a whole number.
    const values = Number.isInteger(max / 2) ? [0, max / 2, max] : [0, max];
    return values.map((value) => ({ value, y: this.y(value) }));
  });

  protected readonly bars = computed(() => {
    const weeks = this.weeks();
    const slot = (this.right() - this.left) / weeks.length;
    const barWidth = Math.min(48, slot * 0.6);
    return weeks.map((week, i) => {
      const x = this.left + slot * i + (slot - barWidth) / 2;
      const total = week.correct + week.incorrect;
      const correctTop = this.y(week.correct);
      const totalTop = this.y(total);
      const hasCorrect = week.correct > 0;
      const hasIncorrect = week.incorrect > 0;
      // Correct at the bottom; incorrect stacked on top with a 2px gap.
      const correctPath = hasCorrect
        ? hasIncorrect
          ? `M${x},${this.baseline}V${correctTop}H${x + barWidth}V${this.baseline}Z`
          : roundedTop(x, correctTop, barWidth, this.baseline - correctTop)
        : null;
      const incorrectBottom = hasCorrect ? correctTop - GAP : this.baseline;
      const incorrectPath = hasIncorrect
        ? roundedTop(x, totalTop, barWidth, Math.max(1, incorrectBottom - totalTop))
        : null;
      return {
        week,
        total,
        label: shortDate(week.weekStart),
        x,
        center: x + barWidth / 2,
        slotX: this.left + slot * i,
        slotWidth: slot,
        totalTop,
        correctPath,
        incorrectPath,
        description: `Semana de ${shortDate(week.weekStart)}: ${week.correct} ${week.correct === 1 ? 'certa' : 'certas'}, ${week.incorrect} ${week.incorrect === 1 ? 'errada' : 'erradas'}`,
      };
    });
  });

  protected readonly readout = computed(() => {
    const index = this.active();
    const bars = this.bars();
    if (index === null) return 'Passe o mouse ou use Tab nas semanas para ver os números.';
    return bars[index]?.description ?? '';
  });

  private y(value: number): number {
    return this.baseline - (value / this.scaleMax()) * (this.baseline - PAD.top);
  }
}
