import { Component, OnInit, inject } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TopbarComponent } from './app/layout/topbar/topbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, CommonModule],
  template: `
    <div
      class="app-wrapper min-h-screen flex flex-col bg-white dark:bg-[#0b1020] transition-colors duration-200"
    >
      <!-- Topbar -->
      <app-topbar></app-topbar>

      <!-- Loading Bar -->
      <div
        *ngIf="isLoading"
        class="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-pulse"
      ></div>

      <!-- Main Content -->
      <main class="flex-1 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <!-- Router Outlet with transition wrapper -->
          <div class="router-content animate-fade-in">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer
        class="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors duration-200"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Brand Section -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg"
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
                <span class="text-xl font-bold text-gray-900 dark:text-white">Deffavia</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                Sistema inteligente de gestión y reserva de asientos con visualización en tiempo
                real.
              </p>
            </div>

            <!-- Quick Links -->
            <div>
              <h3
                class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider"
              >
                Enlaces Rápidos
              </h3>
              <ul class="space-y-3">
                <li>
                  <a
                    href="/"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150"
                  >
                    Inicio
                  </a>
                </li>
                <li>
                  <a
                    href="/seats"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150"
                  >
                    Asientos
                  </a>
                </li>
                <li>
                  <a
                    href="/reservations/wizard"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150"
                  >
                    Reservar
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150"
                  >
                    Acerca de
                  </a>
                </li>
              </ul>
            </div>

            <!-- Contact & Social -->
            <div>
              <h3
                class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider"
              >
                Contacto
              </h3>
              <ul class="space-y-3 mb-4">
                <li>
                  <a
                    href="mailto:taracenadev@gmail.com"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Email
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Defiilol11"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/carlos-taracena-836512217/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      />
                    </svg>
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                © {{ currentYear }} Deffavia. Desarrollado por
                <a
                  href="https://defiilol11.github.io/byme/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-150"
                >
                  Carlos Taracena
                </a>
              </p>
              <div class="flex items-center gap-4">
                <span class="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Hecho con Angular
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <!-- Scroll to Top Button -->
      <button
        *ngIf="showScrollTop"
        (click)="scrollToTop()"
        class="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        aria-label="Volver arriba"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  `,
  styles: [
    `
      .router-content {
        min-height: 400px;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }

      /* Smooth scroll behavior */
      @media (prefers-reduced-motion: no-preference) {
        html {
          scroll-behavior: smooth;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);

  readonly currentYear = new Date().getFullYear();
  isLoading = false;
  showScrollTop = false;

  ngOnInit(): void {
    // Handle loading state during navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
      }
    });

    // Scroll to top on route change
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Show/hide scroll to top button
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showScrollTop = window.pageYOffset > 300;
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
