import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/notification.service';

@Component({
  standalone: true,
  selector: 'app-toast-container',
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md">
      <div
        *ngFor="let notification of notifications()"
        class="toast-enter pointer-events-auto rounded-xl shadow-xl ring-1 overflow-hidden backdrop-blur-sm"
        [ngClass]="{
          'bg-white/95 dark:bg-zinc-900/95 ring-black/5 dark:ring-white/10':
            notification.type === 'info',
          'bg-emerald-50/95 dark:bg-emerald-950/95 ring-emerald-500/20':
            notification.type === 'success',
          'bg-rose-50/95 dark:bg-rose-950/95 ring-rose-500/20': notification.type === 'error',
          'bg-amber-50/95 dark:bg-amber-950/95 ring-amber-500/20': notification.type === 'warning'
        }"
      >
        <div class="flex items-start gap-3 p-4">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <!-- Success -->
            <svg
              *ngIf="notification.type === 'success'"
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

            <!-- Error -->
            <svg
              *ngIf="notification.type === 'error'"
              class="h-6 w-6 text-rose-600 dark:text-rose-400"
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

            <!-- Warning -->
            <svg
              *ngIf="notification.type === 'warning'"
              class="h-6 w-6 text-amber-600 dark:text-amber-400"
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

            <!-- Info -->
            <svg
              *ngIf="notification.type === 'info'"
              class="h-6 w-6 text-blue-600 dark:text-blue-400"
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

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-semibold"
              [ngClass]="{
                'text-emerald-900 dark:text-emerald-100': notification.type === 'success',
                'text-rose-900 dark:text-rose-100': notification.type === 'error',
                'text-amber-900 dark:text-amber-100': notification.type === 'warning',
                'text-zinc-900 dark:text-zinc-100': notification.type === 'info'
              }"
            >
              {{ notification.title }}
            </p>
            <p
              class="mt-1 text-sm"
              [ngClass]="{
                'text-emerald-700 dark:text-emerald-300': notification.type === 'success',
                'text-rose-700 dark:text-rose-300': notification.type === 'error',
                'text-amber-700 dark:text-amber-300': notification.type === 'warning',
                'text-zinc-600 dark:text-zinc-400': notification.type === 'info'
              }"
            >
              {{ notification.message }}
            </p>

            <!-- Action Button -->
            <button
              *ngIf="notification.action"
              (click)="handleAction(notification)"
              class="mt-2 text-xs font-medium underline hover:no-underline transition-all"
              [ngClass]="{
                'text-emerald-800 dark:text-emerald-200': notification.type === 'success',
                'text-rose-800 dark:text-rose-200': notification.type === 'error',
                'text-amber-800 dark:text-amber-200': notification.type === 'warning',
                'text-zinc-700 dark:text-zinc-300': notification.type === 'info'
              }"
            >
              {{ notification.action.label }}
            </button>
          </div>

          <!-- Close Button -->
          <button
            (click)="dismiss(notification.id)"
            class="flex-shrink-0 rounded-lg p-1 transition-colors"
            [ngClass]="{
              'text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50':
                notification.type === 'success',
              'text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/50':
                notification.type === 'error',
              'text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50':
                notification.type === 'warning',
              'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800':
                notification.type === 'info'
            }"
            aria-label="Cerrar notificación"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Progress Bar (duration indicator) -->
        <div
          *ngIf="notification.duration && notification.duration > 0"
          class="h-1 bg-gradient-to-r animate-shrink"
          [ngClass]="{
            'from-emerald-500 to-emerald-600': notification.type === 'success',
            'from-rose-500 to-rose-600': notification.type === 'error',
            'from-amber-500 to-amber-600': notification.type === 'warning',
            'from-blue-500 to-blue-600': notification.type === 'info'
          }"
          [style.animation-duration.ms]="notification.duration"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes toast-enter {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .toast-enter {
        animation: toast-enter 300ms ease-out;
      }

      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }

      .animate-shrink {
        animation: shrink linear;
      }
    `,
  ],
})
export class ToastContainerComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.activeNotifications;

  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }

  handleAction(notification: any) {
    if (notification.action?.callback) {
      notification.action.callback();
    }
    this.dismiss(notification.id);
  }
}
