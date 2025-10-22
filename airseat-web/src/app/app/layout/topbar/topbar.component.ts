import { Component, computed, signal, inject, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, CommonModule, DOCUMENT } from '@angular/common';
import { UserStore } from '../../features/auth/user-store.service';

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

            <!-- User Section -->
            <ng-container *ngIf="isLoggedIn(); else loggedOut">
              <div
                class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700/50"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-md"
                  >
                    {{ getInitials() }}
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
              </div>
              <button
                (click)="logout()"
                class="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
              >
                Salir
              </button>
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
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-md"
              >
                {{ getInitials() }}
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
    `,
  ],
})
export class TopbarComponent {
  private readonly store = inject(UserStore);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly isLoggedIn = computed(() => this.store.isLoggedIn());
  readonly email = computed(() => this.store.currentUser()?.email || '');
  readonly isVip = computed(() => !!this.store.currentUser()?.isVip);
  readonly menuOpen = signal(false);
  readonly theme = signal<'light' | 'dark'>(this.getInitialTheme());

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
