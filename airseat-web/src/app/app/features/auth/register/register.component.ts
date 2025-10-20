import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserStore } from '../user-store.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="panel" style="max-width:520px;margin:auto">
      <h2 style="margin:0 0 .5rem 0">Crear cuenta</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="field">
          <label class="label">Correo (solo @gmail.com / @outlook.com)</label>
          <input
            class="input"
            type="email"
            formControlName="email"
            placeholder="tucorreo@gmail.com"
          />
        </div>
        <div class="field" style="margin-top:.6rem">
          <label class="label">Contraseña</label>
          <input class="input" type="password" formControlName="password" placeholder="********" />
        </div>
        <div style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Creando…' : 'Registrarme' }}
          </button>
          <a routerLink="/auth/login" class="btn secondary">Ya tengo cuenta</a>
        </div>
      </form>
      <p class="help" style="color:#15803d" *ngIf="okMsg">{{ okMsg }}</p>
      <p class="help" style="color:#b91c1c" *ngIf="errMsg">{{ errMsg }}</p>
    </section>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private store = inject(UserStore);
  private router = inject(Router);

  okMsg = '';
  errMsg = '';
  loading = false;

  form = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.pattern(/@(gmail|outlook)\.com$/i)],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    if (this.form.invalid || this.loading) return;
    const { email, password } = this.form.getRawValue();
    this.okMsg = '';
    this.errMsg = '';
    this.loading = true;
    try {
      await this.store.register(email!, password!);
      this.okMsg = 'Cuenta creada y sesión iniciada.';
      setTimeout(() => this.router.navigateByUrl('/reservations/wizard'), 400);
    } catch (e: any) {
      this.errMsg = e?.error?.error || e?.message || 'Error';
    } finally {
      this.loading = false;
    }
  }
}
