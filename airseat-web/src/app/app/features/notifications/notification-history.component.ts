import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

@Component({
  standalone: true,
  selector: 'app-notification-history',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <!-- Header -->
        <div class="mb-6 sm:mb-8">
          <button
            type="button"
            routerLink="/"
            class="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-4 w-4"
            >
              <path
                fill-rule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clip-rule="evenodd"
              />
            </svg>
            Volver
          </button>
          <div class="mt-4 flex items-center justify-between">
            <div>
              <h1
                class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                Notificaciones
              </h1>
              <p class="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Historial completo de tus notificaciones
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                (click)="markAllAsRead()"
                [disabled]="unreadCount() === 0"
                class="btn secondary text-xs sm:text-sm"
              >
                Marcar todas como leídas
              </button>
              <button
                (click)="clearAll()"
                [disabled]="notifications().length === 0"
                class="btn secondary text-xs sm:text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div
            class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total</div>
            <div class="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {{ notifications().length }}
            </div>
          </div>
          <div
            class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">No leídas</div>
            <div class="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">
              {{ unreadCount() }}
            </div>
          </div>
          <div
            class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Éxitos</div>
            <div class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ getCountByType('success') }}
            </div>
          </div>
          <div
            class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Errores</div>
            <div class="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
              {{ getCountByType('error') }}
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-6 flex flex-wrap gap-2">
          <button
            *ngFor="let f of filters"
            (click)="selectedFilter = f.value"
            class="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
            [ngClass]="{
              'bg-violet-600 text-white': selectedFilter === f.value,
              'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-800':
                selectedFilter !== f.value
            }"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Notification List -->
        <div
          *ngIf="filteredNotifications().length === 0"
          class="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <svg
            class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p class="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            No hay notificaciones
          </p>
        </div>

        <div class="space-y-2">
          <div
            *ngFor="let notification of filteredNotifications(); trackBy: trackById"
            class="group rounded-xl bg-white p-4 shadow-sm ring-1 transition-all hover:shadow-md dark:bg-zinc-900"
            [ngClass]="{
              'ring-zinc-200 dark:ring-zinc-800': notification.read,
              'ring-violet-200 bg-violet-50/50 dark:ring-violet-800 dark:bg-violet-950/20':
                !notification.read
            }"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0 mt-0.5">
                <!-- Success -->
                <div
                  *ngIf="notification.type === 'success'"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                >
                  <svg
                    class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <!-- Error -->
                <div
                  *ngIf="notification.type === 'error'"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30"
                >
                  <svg
                    class="h-5 w-5 text-rose-600 dark:text-rose-400"
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
                </div>

                <!-- Warning -->
                <div
                  *ngIf="notification.type === 'warning'"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30"
                >
                  <svg
                    class="h-5 w-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <!-- Info -->
                <div
                  *ngIf="notification.type === 'info'"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
                >
                  <svg
                    class="h-5 w-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <p class="font-semibold text-zinc-900 dark:text-zinc-100">
                      {{ notification.title }}
                    </p>
                    <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {{ notification.message }}
                    </p>
                  </div>
                  <button
                    *ngIf="!notification.read"
                    (click)="markAsRead(notification.id)"
                    class="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    Marcar leída
                  </button>
                </div>
                <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                  {{ formatDate(notification.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationHistoryComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notificationHistory;
  unreadCount = this.notificationService.getUnreadCount.bind(this.notificationService);

  selectedFilter: 'all' | 'unread' | 'success' | 'error' | 'warning' | 'info' = 'all';

  filters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'unread' as const, label: 'No leídas' },
    { value: 'success' as const, label: 'Éxitos' },
    { value: 'error' as const, label: 'Errores' },
    { value: 'warning' as const, label: 'Advertencias' },
    { value: 'info' as const, label: 'Información' },
  ];

  filteredNotifications() {
    const all = this.notifications();
    if (this.selectedFilter === 'all') return all;
    if (this.selectedFilter === 'unread') return all.filter((n) => !n.read);
    return all.filter((n) => n.type === this.selectedFilter);
  }

  getCountByType(type: string): number {
    return this.notifications().filter((n) => n.type === type).length;
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  clearAll() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
      this.notificationService.clearHistory();
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;

    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trackById(_: number, item: any) {
    return item.id;
  }
}
