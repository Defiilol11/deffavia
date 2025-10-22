import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  template: `
    <div
      class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300"
    >
      <!-- Hero Section -->
      <section class="relative overflow-hidden">
        <!-- Decorative Elements -->
        <div
          class="absolute top-0 left-0 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"
        ></div>
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"
        ></div>
        <div
          class="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"
        ></div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div class="text-center space-y-8">
            <!-- Badge -->
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 text-sm font-semibold shadow-sm"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Sistema de Reservas en Tiempo Real</span>
            </div>

            <!-- Main Title -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span class="block text-gray-900 dark:text-white mb-2"> Reserva tu asiento </span>
              <span
                class="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                de manera fácil y rápida
              </span>
            </h1>

            <!-- Description -->
            <p
              class="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              Sistema inteligente de gestión de asientos con visualización en tiempo real.
              <span class="block mt-2 text-base text-gray-500 dark:text-gray-400">
                Demo con estado sincronizado desde la API
              </span>
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                routerLink="/reservations/wizard"
                class="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Comenzar Reserva</span>
                <svg
                  class="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>

              <a
                routerLink="/seats"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 rounded-xl shadow-md hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span>Ver Diagrama</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
            <div class="relative">
              <div
                class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 mb-6"
              >
                <svg
                  class="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Reserva Instantánea
              </h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Selecciona y reserva tu asiento en segundos con nuestro sistema de reservas en
                tiempo real.
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div
            class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
            <div class="relative">
              <div
                class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 mb-6"
              >
                <svg
                  class="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Visualización Interactiva
              </h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Mapa interactivo de asientos con estado actualizado en tiempo real para mejor
                selección.
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div
            class="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
            <div class="relative">
              <div
                class="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/50 mb-6"
              >
                <svg
                  class="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Gestión Completa</h3>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                Administra todas tus reservas desde un panel intuitivo con historial completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions Section -->
      <section class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div class="px-8 py-12 sm:px-12 sm:py-16">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
                  ¿Listo para comenzar?
                </h2>
                <p class="text-purple-100 text-lg mb-8">
                  Accede a tu panel de reservas y gestiona tus asientos de manera eficiente.
                </p>
                <a
                  routerLink="/reservations/my"
                  class="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>Ver Mis Reservas</span>
                </a>
              </div>

              <div class="hidden lg:flex justify-center">
                <div class="relative">
                  <div class="absolute inset-0 bg-white rounded-2xl opacity-10 blur-2xl"></div>
                  <div class="relative grid grid-cols-3 gap-4 p-8">
                    <div
                      class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                    >
                      <span class="text-2xl">💺</span>
                    </div>
                    <div
                      class="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center"
                    >
                      <span class="text-2xl">✓</span>
                    </div>
                    <div
                      class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                    >
                      <span class="text-2xl">🎫</span>
                    </div>
                    <div
                      class="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center"
                    >
                      <span class="text-2xl">📅</span>
                    </div>
                    <div
                      class="w-16 h-16 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl"
                    >
                      <span class="text-2xl">⭐</span>
                    </div>
                    <div
                      class="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center"
                    >
                      <span class="text-2xl">🚀</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      @keyframes blob {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        25% {
          transform: translate(20px, -50px) scale(1.1);
        }
        50% {
          transform: translate(-20px, 20px) scale(0.9);
        }
        75% {
          transform: translate(50px, 50px) scale(1.05);
        }
      }

      .animate-blob {
        animation: blob 10s infinite;
      }

      .animation-delay-2000 {
        animation-delay: 2s;
      }

      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `,
  ],
})
export class HomeComponent {}
