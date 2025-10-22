import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../user-store.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">
        <div
          class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden"
        >
          <div class="px-6 py-6 sm:px-8 sm:py-8">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Iniciar sesión
              </h2>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Bienvenido de vuelta. Ingresa tus credenciales.
              </p>
            </div>

            <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <!-- Email -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                  >Correo <span class="text-red-600">*</span></label
                >
                <div class="mt-1 relative rounded-lg shadow-sm">
                  <input
                    id="email"
                    type="email"
                    autocomplete="email"
                    formControlName="email"
                    [attr.aria-invalid]="
                      form.get('email')?.invalid &&
                      (form.get('email')?.touched || form.get('email')?.dirty)
                    "
                    class="block w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-2.5"
                    placeholder="tucorreo@gmail.com"
                    [disabled]="loading"
                  />
                </div>
                <p
                  *ngIf="
                    form.get('email')?.hasError('required') &&
                    (form.get('email')?.touched || form.get('email')?.dirty)
                  "
                  class="mt-1 text-sm text-red-600"
                >
                  El correo es obligatorio.
                </p>
                <p
                  *ngIf="
                    form.get('email')?.hasError('email') &&
                    (form.get('email')?.touched || form.get('email')?.dirty)
                  "
                  class="mt-1 text-sm text-red-600"
                >
                  Ingresa un correo válido.
                </p>
              </div>

              <!-- Password -->
              <div>
                <div class="flex items-center justify-between">
                  <label
                    for="password"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >Contraseña <span class="text-red-600">*</span></label
                  >
                </div>
                <div class="mt-1 relative">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    id="password"
                    autocomplete="current-password"
                    formControlName="password"
                    class="block w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-2.5 pr-12"
                    placeholder="••••••••"
                    [disabled]="loading"
                  />
                  <button
                    type="button"
                    (click)="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    <svg
                      *ngIf="!showPassword"
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      *ngIf="showPassword"
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.241-3.592m3.276-2.547A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.972 9.972 0 01-4.043 5.197M15 12a3 3 0 00-3-3m0 0a3 3 0 013 3m-3-3L3 21"
                      />
                    </svg>
                  </button>
                </div>
                <p
                  *ngIf="
                    form.get('password')?.hasError('required') &&
                    (form.get('password')?.touched || form.get('password')?.dirty)
                  "
                  class="mt-1 text-sm text-red-600"
                >
                  La contraseña es obligatoria.
                </p>
              </div>

              <!-- Actions -->
              <div class="pt-2 space-y-3">
                <button
                  type="submit"
                  class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2.5 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  [disabled]="form.invalid || loading"
                >
                  <svg
                    *ngIf="loading"
                    class="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
                    <path class="opacity-75" stroke-width="4" d="M4 12a8 8 0 018-8"></path>
                  </svg>
                  <span>{{ loading ? 'Entrando…' : 'Entrar' }}</span>
                </button>

                <div class="text-center text-sm">
                  <span class="text-gray-600 dark:text-gray-300">¿No tienes cuenta?</span>
                  <a
                    routerLink="/auth/register"
                    class="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >Crear cuenta</a
                  >
                </div>
              </div>
            </form>

            <div
              *ngIf="errMsg"
              class="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 text-sm"
            >
              {{ errMsg }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(UserStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errMsg = '';
  returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/reservations/wizard';
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.errMsg = '';
    this.loading = true;
    const { email, password } = this.form.getRawValue();
    try {
      await this.store.login(email!, password!);
      this.router.navigateByUrl(this.returnUrl);
    } catch (e: any) {
      this.errMsg = e?.error?.error || e?.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
