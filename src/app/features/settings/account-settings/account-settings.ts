import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../core/auth/account.service';

type Mode = 'entrar' | 'criar';

/** Minimum length the backend enforces (Credentials.MIN_PASSWORD); the server checks again. */
export const MIN_PASSWORD = 12;

@Component({
  selector: 'app-account-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './account-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettings {
  private readonly accounts = inject(AccountService);

  protected readonly account = this.accounts.account;
  protected readonly connectionError = this.accounts.connectionError;
  protected readonly mode = signal<Mode>('entrar');
  protected readonly busy = signal(false);
  protected readonly submitted = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly minPassword = MIN_PASSWORD;

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly submitLabel = computed(() =>
    this.mode() === 'entrar' ? 'Entrar' : 'Criar conta',
  );

  protected setMode(mode: Mode): void {
    this.mode.set(mode);
    this.serverError.set(null);
    const password = this.form.controls.password;
    password.setValidators(
      mode === 'criar'
        ? [Validators.required, Validators.minLength(MIN_PASSWORD)]
        : [Validators.required],
    );
    password.updateValueAndValidity();
  }

  protected showError(field: 'email' | 'password'): boolean {
    return this.submitted() && this.form.controls[field].invalid;
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.serverError.set(null);
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.busy.set(true);
    try {
      if (this.mode() === 'entrar') await this.accounts.signIn(email, password);
      else await this.accounts.register(email, password);
      this.form.reset();
      this.submitted.set(false);
    } catch (error) {
      this.serverError.set(error instanceof Error ? error.message : 'Não foi possível concluir.');
    } finally {
      this.busy.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    this.busy.set(true);
    this.serverError.set(null);
    try {
      await this.accounts.signOut();
    } catch (error) {
      this.serverError.set(error instanceof Error ? error.message : 'Não foi possível sair.');
    } finally {
      this.busy.set(false);
    }
  }
}
