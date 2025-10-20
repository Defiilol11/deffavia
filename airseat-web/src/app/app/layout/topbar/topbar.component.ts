import { Component, computed, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { UserStore } from '../../features/auth/user-store.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" routerLink="/">
          <span class="logo-dot"></span>
          <span class="brand-name">Deffavia</span>
        </a>

        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            >Inicio</a
          >
          <a routerLink="/seats" routerLinkActive="active">Asientos</a>
          <a routerLink="/reservations/wizard" routerLinkActive="active">Reservar</a>
          <a routerLink="/reservations/my" routerLinkActive="active">Mis reservas</a>
        </nav>

        <div class="auth">
          <ng-container *ngIf="isLoggedIn(); else loggedOut">
            <div class="user-chip">
              <span class="email">{{ email() }}</span>
              <span *ngIf="isVip()" class="vip">VIP</span>
            </div>
            <button class="btn ghost" (click)="logout()">Cerrar sesión</button>
          </ng-container>
          <ng-template #loggedOut>
            <a class="btn ghost" routerLink="/auth/login">Iniciar sesión</a>
            <a class="btn secondary" routerLink="/auth/register">Crear cuenta</a>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  private store = inject(UserStore);
  private router = inject(Router);

  isLoggedIn = computed(() => this.store.isLoggedIn());
  email = computed(() => this.store.currentUser()?.email || '');
  isVip = computed(() => !!this.store.currentUser()?.isVip);

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }
}
