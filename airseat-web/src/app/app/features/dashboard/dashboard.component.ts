import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserStore } from '../auth/user-store.service';
import { ReservationsApi } from '../../core/reservations-api.service';
import { NotificationService } from '../../core/notification.service';

interface DashboardStats {
  totalReservations: number;
  activeReservations: number;
  canceledReservations: number;
  modifiedCount: number;
  totalSpent: number;
  averageSpent: number;
  favoriteClass: 'business' | 'economy' | null;
  vipProgress: number; // 0-100%
  reservationsUntilVip: number;
}

interface RecentReservation {
  id: number;
  reserved_at: string;
  status: string;
  price_total: number;
  itemCount: number;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <!-- Header -->
        <div class="mb-8">
          <h1
            class="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent"
          >
            Mi Dashboard
          </h1>
          <p class="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Bienvenido, {{ userEmail() }}
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="space-y-6">
          <div class="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
            <div class="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
            <div class="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
            <div class="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading() && error()" class="rounded-xl bg-rose-50 p-6 dark:bg-rose-950/20">
          <p class="text-sm font-medium text-rose-600 dark:text-rose-400">{{ error() }}</p>
        </div>

        <div *ngIf="!loading() && !error()" class="space-y-6">
          <!-- VIP Progress Card (destacado) -->
          <div
            *ngIf="!isVip()"
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 shadow-xl"
          >
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-xl font-bold text-white">Progreso VIP</h2>
                  <p class="mt-1 text-sm text-violet-100">
                    {{ stats().reservationsUntilVip }} reservas para desbloquear beneficios VIP
                  </p>
                </div>
                <div
                  class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                >
                  <span class="text-2xl font-bold text-white">{{ stats().vipProgress }}%</span>
                </div>
              </div>
              <div class="h-3 rounded-full bg-white/20 overflow-hidden">
                <div
                  class="h-full rounded-full bg-white transition-all duration-500"
                  [style.width.%]="stats().vipProgress"
                ></div>
              </div>
              <p class="mt-3 text-xs text-violet-100">
                🎁 Beneficios VIP: 10% descuento en todas las reservas
              </p>
            </div>
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
            <div
              class="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-2xl"
            ></div>
          </div>

          <!-- VIP Badge (si ya es VIP) -->
          <div
            *ngIf="isVip()"
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-6 shadow-xl"
          >
            <div class="relative z-10 flex items-center gap-4">
              <div
                class="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg"
              >
                <span class="text-4xl">👑</span>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-extrabold text-amber-950">¡Eres Usuario VIP!</h2>
                <p class="mt-1 text-sm text-amber-900">
                  Disfrutando 10% de descuento en todas tus reservas
                </p>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Reservas -->
            <div
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Reservas</p>
                  <p class="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {{ stats().totalReservations }}
                  </p>
                </div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30"
                >
                  <svg
                    class="h-6 w-6 text-violet-600 dark:text-violet-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Activas -->
            <div
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Activas</p>
                  <p class="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {{ stats().activeReservations }}
                  </p>
                </div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                >
                  <svg
                    class="h-6 w-6 text-emerald-600 dark:text-emerald-400"
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

            <!-- Gasto Total -->
            <div
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Gasto Total</p>
                  <p class="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Q{{ stats().totalSpent | number : '1.0-0' }}
                  </p>
                </div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
                >
                  <svg
                    class="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Promedio por Reserva -->
            <div
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Promedio</p>
                  <p class="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Q{{ stats().averageSpent | number : '1.0-0' }}
                  </p>
                </div>
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30"
                >
                  <svg
                    class="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              routerLink="/reservations/wizard"
              class="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 hover:ring-violet-300 hover:shadow-md transition-all dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-violet-700"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg group-hover:scale-110 transition-transform"
                >
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Nueva Reserva</h3>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Reserva tus asientos ahora
                  </p>
                </div>
              </div>
            </a>

            <a
              routerLink="/reservations/my"
              class="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 hover:ring-emerald-300 hover:shadow-md transition-all dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-emerald-700"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform"
                >
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Mis Reservas</h3>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Ver y gestionar reservas
                  </p>
                </div>
              </div>
            </a>

            <a
              routerLink="/profile"
              class="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 hover:ring-blue-300 hover:shadow-md transition-all dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-blue-700"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg group-hover:scale-110 transition-transform"
                >
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Mi Perfil</h3>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Editar información</p>
                </div>
              </div>
            </a>
          </div>

          <!-- Insights & Recommendations -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Preferencias -->
            <div
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Tus Preferencias
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">Clase favorita</span>
                  <span
                    *ngIf="stats().favoriteClass"
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize"
                    [ngClass]="{
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                        stats().favoriteClass === 'business',
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300':
                        stats().favoriteClass === 'economy'
                    }"
                  >
                    {{ stats().favoriteClass === 'business' ? 'Negocios' : 'Económica' }}
                  </span>
                  <span
                    *ngIf="!stats().favoriteClass"
                    class="text-sm text-zinc-400 dark:text-zinc-500"
                  >
                    No definido
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">Modificaciones</span>
                  <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {{ stats().modifiedCount }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">Canceladas</span>
                  <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {{ stats().canceledReservations }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Actividad Reciente
              </h3>
              <div *ngIf="recentReservations().length === 0" class="text-center py-4">
                <p class="text-sm text-zinc-500 dark:text-zinc-400">No hay actividad reciente</p>
              </div>
              <div class="space-y-3">
                <div
                  *ngFor="let reservation of recentReservations().slice(0, 3)"
                  class="flex items-center justify-between"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Reserva #{{ reservation.id }}
                    </p>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">
                      {{ formatDate(reservation.reserved_at) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Q{{ reservation.price_total | number : '1.2-2' }}
                    </p>
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300':
                          reservation.status === 'active',
                        'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300':
                          reservation.status === 'canceled'
                      }"
                    >
                      {{ reservation.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private userStore = inject(UserStore);
  private reservationsApi = inject(ReservationsApi);
  private notifications = inject(NotificationService);

  userEmail = computed(() => this.userStore.currentUser()?.email || '');
  isVip = computed(() => !!this.userStore.currentUser()?.isVip);

  loading = signal(true);
  error = signal('');

  stats = signal<DashboardStats>({
    totalReservations: 0,
    activeReservations: 0,
    canceledReservations: 0,
    modifiedCount: 0,
    totalSpent: 0,
    averageSpent: 0,
    favoriteClass: null,
    vipProgress: 0,
    reservationsUntilVip: 5,
  });

  recentReservations = signal<RecentReservation[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading.set(true);
    this.error.set('');

    this.reservationsApi.getMyReservations().subscribe({
      next: (resp) => {
        const orders = resp.orders || [];
        const items = resp.items || [];

        // Calculate stats
        const totalReservations = orders.length;
        const activeReservations = orders.filter((o: any) => o.status === 'active').length;
        const canceledReservations = orders.filter((o: any) => o.status === 'canceled').length;

        const totalSpent = orders.reduce((acc: number, o: any) => acc + (o.price_total || 0), 0);
        const averageSpent = totalReservations > 0 ? totalSpent / totalReservations : 0;

        // Count modified items
        const modifiedCount = items.filter((i: any) => i.modified_count > 0).length;

        // Find favorite class
        const businessCount = items.filter((i: any) => i.seat_class === 'business').length;
        const economyCount = items.filter((i: any) => i.seat_class === 'economy').length;
        const favoriteClass =
          businessCount > economyCount
            ? ('business' as const)
            : economyCount > 0
            ? ('economy' as const)
            : null;

        // VIP progress (assuming 5 reservations needed)
        const vipThreshold = 5;
        const vipProgress = Math.min(100, (totalReservations / vipThreshold) * 100);
        const reservationsUntilVip = Math.max(0, vipThreshold - totalReservations);

        this.stats.set({
          totalReservations,
          activeReservations,
          canceledReservations,
          modifiedCount,
          totalSpent,
          averageSpent,
          favoriteClass,
          vipProgress,
          reservationsUntilVip,
        });

        // Recent reservations (last 5)
        this.recentReservations.set(
          orders.slice(0, 5).map((o: any) => ({
            id: o.id,
            reserved_at: o.reserved_at,
            status: o.status,
            price_total: o.price_total,
            itemCount: items.filter((i: any) => i.order_id === o.id).length,
          }))
        );

        this.loading.set(false);

        // Show welcome notification
        this.notifications.info(
          'Dashboard actualizado',
          `Tienes ${activeReservations} ${
            activeReservations === 1 ? 'reserva activa' : 'reservas activas'
          }`
        );
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || err.message || 'Error al cargar datos');
        this.notifications.error('Error', 'No se pudo cargar el dashboard');
      },
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
