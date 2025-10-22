import { Component, computed, signal, inject, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, CommonModule, DOCUMENT } from '@angular/common';
import { UserStore } from '../../features/auth/user-store.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header
      class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a
            routerLink="/"
            class="flex items-center gap-2 group transition-transform hover:scale-105 duration-200"
          >
            <div class="relative">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 dark:shadow-purple-500/50 transition-shadow duration-200 group-hover:shadow-purple-500/50 dark:group-hover:shadow-purple-500/70"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>
            <span
              class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            >
              Deffavia
            </span>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <a
              routerLink="/"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              Inicio
            </a>
            <a
              routerLink="/seats"
              routerLinkActive="active-link"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              Asientos
            </a>
            <a
              routerLink="/reservations/wizard"
              routerLinkActive="active-link"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              Reservar
            </a>
            <a
              routerLink="/reservations/my"
              routerLinkActive="active-link"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              Mis reservas
            </a>
          </nav>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-2">
            <!-- Global VIP indicator -->
            <span
              *ngIf="isLoggedIn() && isVip()"
              class="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 border border-yellow-600/30 shadow-sm"
              title="Usuario VIP"
            >
              👑 VIP
            </span>
            <!-- Theme Toggle -->
            <button
              (click)="toggleTheme()"
              [attr.aria-label]="
                theme() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
              "
              class="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-150"
            >
              <svg
                *ngIf="theme() === 'light'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <svg
                *ngIf="theme() === 'dark'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>

            <!-- Notifications Bell (only when logged in) -->
            <a
              *ngIf="isLoggedIn()"
              routerLink="/notifications"
              class="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-150"
              aria-label="Notificaciones"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span
                *ngIf="unreadNotifications() > 0"
                class="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900"
              >
                {{ unreadNotifications() > 9 ? '9+' : unreadNotifications() }}
              </span>
            </a>

            <!-- User Section -->
            <ng-container *ngIf="isLoggedIn(); else loggedOut">
              <!-- User Menu Desktop -->
              <div class="hidden sm:relative sm:inline-block">
                <button
                  (click)="toggleUserMenu()"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700/50 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-150"
                >
                  <div class="flex items-center gap-2">
                    <div class="relative" [class.vip-active]="isVip()">
                      <div
                        class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-md avatar-circle"
                      >
                        {{ getInitials() }}
                      </div>
                      <span
                        *ngIf="isVip()"
                        class="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-[10px] font-bold shadow ring-2 ring-white dark:ring-slate-900"
                        title="Usuario VIP"
                      >
                        👑
                      </span>
                    </div>
                    <span
                      class="text-sm font-semibold text-gray-900 dark:text-white max-w-[120px] truncate"
                    >
                      {{ email() }}
                    </span>
                  </div>
                  <span
                    *ngIf="isVip()"
                    class="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full shadow-sm"
                  >
                    VIP
                  </span>
                  <svg
                    class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                    [class.rotate-180]="userMenuOpen()"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  *ngIf="userMenuOpen()"
                  class="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 animate-fade-in"
                >
                  <a
                    routerLink="/dashboard"
                    (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Dashboard
                  </a>
                  <a
                    routerLink="/profile"
                    (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Mi Perfil
                  </a>
                  <div class="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                  <button
                    (click)="logout()"
                    class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </ng-container>

            <ng-template #loggedOut>
              <a
                routerLink="/auth/login"
                class="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-150"
              >
                Iniciar sesión
              </a>
              <a
                routerLink="/auth/register"
                class="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-150"
              >
                Crear cuenta
              </a>
            </ng-template>

            <!-- Mobile Menu Button -->
            <button
              (click)="toggleMenu()"
              class="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-150"
              [attr.aria-label]="menuOpen() ? 'Cerrar menú' : 'Abrir menú'"
            >
              <svg
                *ngIf="!menuOpen()"
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                *ngIf="menuOpen()"
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div
          *ngIf="menuOpen()"
          class="md:hidden py-4 border-t border-gray-200 dark:border-slate-700 animate-fade-in"
        >
          <nav class="flex flex-col gap-2">
            <a
              routerLink="/"
              routerLinkActive="active-link-mobile"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMenu()"
              class="px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              🏠 Inicio
            </a>
            <a
              routerLink="/seats"
              routerLinkActive="active-link-mobile"
              (click)="closeMenu()"
              class="px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              💺 Asientos
            </a>
            <a
              routerLink="/reservations/wizard"
              routerLinkActive="active-link-mobile"
              (click)="closeMenu()"
              class="px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              📝 Reservar
            </a>
            <a
              routerLink="/reservations/my"
              routerLinkActive="active-link-mobile"
              (click)="closeMenu()"
              class="px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              📋 Mis reservas
            </a>
          </nav>

          <div
            *ngIf="isLoggedIn(); else mobileLoggedOut"
            class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3"
          >
            <div class="flex items-center gap-3 px-4">
              <div class="relative" [class.vip-active]="isVip()">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-md avatar-circle"
                >
                  {{ getInitials() }}
                </div>
                <span
                  *ngIf="isVip()"
                  class="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-[11px] font-bold shadow ring-2 ring-white dark:ring-slate-900"
                  title="Usuario VIP"
                >
                  👑
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ email() }}
                </p>
                <span
                  *ngIf="isVip()"
                  class="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full"
                >
                  VIP
                </span>
              </div>
            </div>
            <a
              routerLink="/dashboard"
              routerLinkActive="active-link-mobile"
              (click)="closeMenu()"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </a>
            <a
              routerLink="/profile"
              routerLinkActive="active-link-mobile"
              (click)="closeMenu()"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
            >
              👤 Mi Perfil
            </a>
            <button
              (click)="logout()"
              class="w-full px-4 py-3 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 text-left"
            >
              🚪 Cerrar sesión
            </button>
          </div>

          <ng-template #mobileLoggedOut>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
              <a
                routerLink="/auth/login"
                (click)="closeMenu()"
                class="block px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-150 text-center"
              >
                Iniciar sesión
              </a>
              <a
                routerLink="/auth/register"
                (click)="closeMenu()"
                class="block px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md transition-all duration-150 text-center"
              >
                Crear cuenta
              </a>
            </div>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .active-link {
        @apply text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30;
      }

      .active-link-mobile {
        @apply text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 font-bold;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }

      /* VIP animated border around avatar */
      @keyframes vip-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.55); /* amber-400 */
        }
        70% {
          box-shadow: 0 0 0 8px rgba(251, 191, 36, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
        }
      }

      .vip-active .avatar-circle {
        border: 2px solid #f59e0b; /* amber-500 */
        animation: vip-pulse 2s ease-out infinite;
      }
    `,
  ],
})
export class TopbarComponent {
  private readonly store = inject(UserStore);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly notificationService = inject(NotificationService);

  readonly isLoggedIn = computed(() => this.store.isLoggedIn());
  readonly email = computed(() => this.store.currentUser()?.email || '');
  readonly isVip = computed(() => !!this.store.currentUser()?.isVip);
  readonly menuOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly theme = signal<'light' | 'dark'>(this.getInitialTheme());
  readonly unreadNotifications = computed(() => this.notificationService.getUnreadCount());

  constructor() {
    // Apply theme on init
    effect(() => {
      const isDark = this.theme() === 'dark';
      this.document.documentElement.classList.toggle('dark', isDark);
    });
  }

  private getInitialTheme(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  toggleTheme(): void {
    const newTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(newTheme);

    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  getInitials(): string {
    const emailValue = this.email();
    if (!emailValue) return '?';

    return emailValue.charAt(0).toUpperCase();
  }

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }
}
