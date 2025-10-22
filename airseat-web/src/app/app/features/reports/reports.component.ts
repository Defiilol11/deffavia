import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsApiService, ReportSummaryResponse } from '../../core/reports-api.service';
import { SeatMapComponent } from '../seats/seat-map/seat-map.component';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, SeatMapComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            📊 Panel de Reportes
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Resumen general del sistema de reservas
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          ></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando reportes...</p>
        </div>

        <!-- Error State -->
        <div
          *ngIf="error()"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <p class="text-red-800 dark:text-red-300">{{ error() }}</p>
          <button
            (click)="loadData()"
            class="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>

        <!-- Data Display -->
        <div *ngIf="!loading() && !error() && data()" class="space-y-4 sm:space-y-6">
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <!-- Total Users -->
            <div
              class="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-slate-700"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div class="flex-1">
                  <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Usuarios
                  </p>
                  <p
                    class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2"
                  >
                    {{ data()!.users }}
                  </p>
                </div>
                <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 sm:p-3 self-start">
                  <svg
                    class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Modified -->
            <div
              class="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-slate-700"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div class="flex-1">
                  <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Modificados
                  </p>
                  <p
                    class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2"
                  >
                    {{ data()!.modificados }}
                  </p>
                </div>
                <div class="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-2 sm:p-3 self-start">
                  <svg
                    class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Canceled -->
            <div
              class="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-slate-700"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div class="flex-1">
                  <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cancelados
                  </p>
                  <p
                    class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2"
                  >
                    {{ data()!.cancelados }}
                  </p>
                </div>
                <div class="bg-red-100 dark:bg-red-900/30 rounded-full p-2 sm:p-3 self-start">
                  <svg
                    class="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Total Reservations -->
            <div
              class="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-slate-700"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div class="flex-1">
                  <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Reservas
                  </p>
                  <p
                    class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2"
                  >
                    {{ getTotalReservations() }}
                  </p>
                </div>
                <div class="bg-green-100 dark:bg-green-900/30 rounded-full p-2 sm:p-3 self-start">
                  <svg
                    class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Seat Map and Mode Selection -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <!-- Seat Map - Mini Version -->
            <div
              class="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 xl:col-span-2"
            >
              <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  ✈️ Mapa de Asientos
                </h2>
              </div>
              <div class="p-3 sm:p-4 overflow-x-auto">
                <div class="seat-map-mini">
                  <app-seat-map
                    [pickMode]="false"
                    [seatModes]="data()?.seatsByMode || []"
                  ></app-seat-map>
                </div>
              </div>
            </div>

            <!-- Reservation Modes -->
            <div
              class="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700"
            >
              <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  🎯 Modo de Reserva
                </h2>
              </div>
              <div class="p-4 sm:p-6 space-y-3">
                <div
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Manual
                    </span>
                  </div>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ data()!.manual }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Aleatorio
                    </span>
                  </div>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ data()!.random }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Importado
                    </span>
                  </div>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ data()!.imported }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Seat Occupancy - Full Width -->
          <div
            class="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700"
          >
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                🪑 Ocupación de Asientos
              </h2>
            </div>
            <div class="p-4 sm:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Business Class -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Business
                    </span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ data()!.businessOcup }} / {{ data()!.businessOcup + data()!.businessFree }}
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      class="bg-purple-600 h-3 rounded-full transition-all duration-500"
                      [style.width.%]="getOccupancyPercent('business')"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ getOccupancyPercent('business') | number : '1.1-1' }}% ocupado
                  </p>
                </div>

                <!-- Economy Class -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Economy
                    </span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ data()!.economyOcup }} / {{ data()!.economyOcup + data()!.economyFree }}
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      class="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      [style.width.%]="getOccupancyPercent('economy')"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ getOccupancyPercent('economy') | number : '1.1-1' }}% ocupado
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Reservations by User Table -->
          <div
            class="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700"
          >
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                👥 Reservas por Usuario
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th
                      class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Cantidad de Reservas
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
                  <tr
                    *ngFor="let user of data()!.reservasPorUsuario; let i = index"
                    class="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td
                      class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{ i + 1 }}
                    </td>
                    <td
                      class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ user.user_email }}
                    </td>
                    <td
                      class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right"
                    >
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      >
                        {{ user.orders_count }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="!data()!.reservasPorUsuario?.length">
                    <td
                      colspan="3"
                      class="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No hay datos de reservas por usuario
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Refresh Button -->
          <div class="flex justify-center">
            <button
              (click)="loadData()"
              [disabled]="loading()"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                class="w-5 h-5"
                [class.animate-spin]="loading()"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ loading() ? 'Actualizando...' : 'Actualizar datos' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .seat-map-mini {
        transform: scale(0.5);
        transform-origin: top left;
        width: 200%;
      }

      @media (min-width: 640px) {
        .seat-map-mini {
          transform: scale(0.65);
          width: 154%;
        }
      }

      @media (min-width: 1024px) {
        .seat-map-mini {
          transform: scale(0.75);
          width: 133%;
        }
      }

      @media (min-width: 1280px) {
        .seat-map-mini {
          transform: scale(0.8);
          width: 125%;
        }
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  private reportsApi = inject(ReportsApiService);

  data = signal<ReportSummaryResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.reportsApi.getSummary().subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los reportes. Por favor, intenta de nuevo.');
        this.loading.set(false);
        console.error('Error loading reports:', err);
      },
    });
  }

  getTotalReservations(): number {
    const d = this.data();
    if (!d) return 0;
    return d.manual + d.random + d.imported;
  }

  getOccupancyPercent(classType: 'business' | 'economy'): number {
    const d = this.data();
    if (!d) return 0;

    if (classType === 'business') {
      const total = d.businessOcup + d.businessFree;
      return total > 0 ? (d.businessOcup / total) * 100 : 0;
    } else {
      const total = d.economyOcup + d.economyFree;
      return total > 0 ? (d.economyOcup / total) * 100 : 0;
    }
  }
}
