import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { LucideTriangleAlert } from '@lucide/angular';

let nextId = 0;

/**
 * Confirmation for destructive actions, built on the native modal <dialog>
 * (focus is kept inside, Escape cancels and focus returns to the trigger on close).
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [LucideTriangleAlert],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly id = `confirm-dialog-${nextId++}`;

  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input.required<string>();

  readonly confirmed = output();
  /** Closed without confirming: Cancel button, Escape or the dialog being dismissed. */
  readonly cancelled = output();

  private confirming = false;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  protected cancel(): void {
    this.dialog().nativeElement.close();
  }

  protected confirm(): void {
    this.confirming = true;
    this.dialog().nativeElement.close();
    this.confirmed.emit();
  }

  protected closed(): void {
    if (!this.confirming) this.cancelled.emit();
    this.confirming = false;
  }
}
