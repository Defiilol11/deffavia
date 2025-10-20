import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserStore } from '../user-store.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="panel" style="max-width:520px;margin:auto">
      <h2 style="margin:0 0 .5rem 0">Iniciar sesión</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="field">
          <label class="label">Correo</label>
          <input
            class="input"
            formControlName="email"
            type="email"
            placeholder="tucorreo@gmail.com"
          />
        </div>
        <div class="field" style="margin-top:.6rem">
          <label class="label">Contraseña</label>
          <input class="input" formControlName="password" type="password" placeholder="********" />
        </div>
        <div style="margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Entrando…' : 'Entrar' }}
          </button>
          <a routerLink="/auth/register" class="btn secondary">Crear cuenta</a>
        </div>
      </form>
      <p class="help" style="color:#b91c1c" *ngIf="errMsg">{{ errMsg }}</p>
    </section>
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
