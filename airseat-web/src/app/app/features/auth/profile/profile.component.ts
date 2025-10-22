import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserStore } from '../user-store.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <!-- Header -->
        <div class="mb-6 sm:mb-8">
          <button
            type="button"
            routerLink="/"
            class="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-4 w-4"
            >
              <path
                fill-rule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clip-rule="evenodd"
              />
            </svg>
            Volver
          </button>
          <h1
            class="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            Mi Perfil
          </h1>
          <p class="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Gestiona tu información personal y contraseña
          </p>
        </div>

        <!-- Información actual -->
        <div
          class="mb-6 rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Información Actual
          </h2>
          <div class="flex items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-bold text-lg"
            >
              {{ (currentUser()?.email ?? '').charAt(0).toUpperCase() || 'U' }}
            </div>
            <div>
              <div class="font-semibold text-zinc-900 dark:text-zinc-100">
                {{ currentUser()?.email }}
              </div>
              <div class="text-xs text-zinc-500 dark:text-zinc-400">
                ID: {{ currentUser()?.id }}
              </div>
            </div>
          </div>
        </div>

        <!-- Grid de formularios -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Formulario: Cambiar Email -->
          <div
            class="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Cambiar Correo Electrónico
            </h2>
            <form [formGroup]="emailForm" (ngSubmit)="updateEmail()" class="space-y-4">
              <div>
                <label for="newEmail" class="label">Nuevo correo electrónico</label>
                <input
                  id="newEmail"
                  type="email"
                  formControlName="email"
                  class="input"
                  placeholder="nuevo@ejemplo.com"
                />
                <p
                  *ngIf="emailForm.get('email')?.touched && emailForm.get('email')?.invalid"
                  class="mt-1 text-xs text-rose-600 dark:text-rose-400"
                >
                  Correo inválido (solo @gmail.com o @outlook.com)
                </p>
              </div>

              <div
                *ngIf="emailMessage()"
                class="rounded-lg p-3 text-sm"
                [ngClass]="{
                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300':
                    emailSuccess(),
                  'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300': !emailSuccess()
                }"
              >
                {{ emailMessage() }}
              </div>

              <button
                type="submit"
                class="btn w-full"
                [disabled]="emailForm.invalid || loadingEmail()"
              >
                <span
                  *ngIf="loadingEmail()"
                  class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                ></span>
                <span *ngIf="!loadingEmail()">Actualizar Correo</span>
              </button>
            </form>
          </div>

          <!-- Formulario: Cambiar Contraseña -->
          <div
            class="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Cambiar Contraseña
            </h2>
            <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()" class="space-y-4">
              <div>
                <label for="currentPassword" class="label">Contraseña actual</label>
                <input
                  id="currentPassword"
                  type="password"
                  formControlName="currentPassword"
                  class="input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>

              <div>
                <label for="newPassword" class="label">Nueva contraseña</label>
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  class="input"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <p
                  *ngIf="
                    passwordForm.get('newPassword')?.touched &&
                    passwordForm.get('newPassword')?.invalid
                  "
                  class="mt-1 text-xs text-rose-600 dark:text-rose-400"
                >
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label for="confirmPassword" class="label">Confirmar nueva contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  class="input"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <p
                  *ngIf="
                    passwordForm.get('confirmPassword')?.touched &&
                    passwordForm.hasError('mismatch')
                  "
                  class="mt-1 text-xs text-rose-600 dark:text-rose-400"
                >
                  Las contraseñas no coinciden
                </p>
              </div>

              <div
                *ngIf="passwordMessage()"
                class="rounded-lg p-3 text-sm"
                [ngClass]="{
                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300':
                    passwordSuccess(),
                  'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300':
                    !passwordSuccess()
                }"
              >
                {{ passwordMessage() }}
              </div>

              <button
                type="submit"
                class="btn w-full"
                [disabled]="passwordForm.invalid || loadingPassword()"
              >
                <span
                  *ngIf="loadingPassword()"
                  class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                ></span>
                <span *ngIf="!loadingPassword()">Actualizar Contraseña</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .label {
        @apply mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300;
      }
      .input {
        @apply w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm transition-colors focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-violet-500;
      }
      .btn {
        @apply inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-violet-600 disabled:hover:to-fuchsia-600;
      }
    `,
  ],
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private userStore = inject(UserStore);
  private router = inject(Router);

  currentUser = this.userStore.currentUser;

  loadingEmail = signal(false);
  emailMessage = signal('');
  emailSuccess = signal(false);

  loadingPassword = signal(false);
  passwordMessage = signal('');
  passwordSuccess = signal(false);

  emailForm: FormGroup;
  passwordForm: FormGroup;

  constructor() {
    // Validador personalizado para dominios permitidos
    const emailDomainValidator = (control: any) => {
      const email = control.value;
      if (!email) return null;
      const validDomain = /@(gmail|outlook)\.com$/i.test(email);
      return validDomain ? null : { invalidDomain: true };
    };

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, emailDomainValidator]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Validador personalizado para confirmar contraseñas
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  async updateEmail() {
    if (this.emailForm.invalid) return;

    this.loadingEmail.set(true);
    this.emailMessage.set('');

    try {
      const { email } = this.emailForm.value;
      await this.userStore.updateProfile({ email });

      this.emailSuccess.set(true);
      this.emailMessage.set('✓ Correo actualizado exitosamente');
      this.emailForm.reset();

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => this.emailMessage.set(''), 5000);
    } catch (error: any) {
      this.emailSuccess.set(false);
      this.emailMessage.set(error.error?.error || error.message || 'Error al actualizar correo');
    } finally {
      this.loadingEmail.set(false);
    }
  }

  async updatePassword() {
    if (this.passwordForm.invalid) return;

    this.loadingPassword.set(true);
    this.passwordMessage.set('');

    try {
      const { currentPassword, newPassword } = this.passwordForm.value;
      await this.userStore.updateProfile({
        password: newPassword,
        currentPassword,
      });

      this.passwordSuccess.set(true);
      this.passwordMessage.set('✓ Contraseña actualizada exitosamente');
      this.passwordForm.reset();

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => this.passwordMessage.set(''), 5000);
    } catch (error: any) {
      this.passwordSuccess.set(false);
      this.passwordMessage.set(
        error.error?.error || error.message || 'Error al actualizar contraseña'
      );
    } finally {
      this.loadingPassword.set(false);
    }
  }
}
