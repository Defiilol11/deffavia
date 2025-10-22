import { Injectable, signal, inject, effect } from '@angular/core';
import { UserStore } from '../features/auth/user-store.service';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // ms, 0 = no auto-dismiss
  read?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private userStore = inject(UserStore);
  // Notificaciones activas (toasts visibles)
  activeNotifications = signal<Notification[]>([]);

  // Historial completo (persiste en localStorage)
  private readonly STORAGE_KEY_BASE = 'notification_history';
  private storageKeyForUser = signal<string>(this.computeStorageKey());
  notificationHistory = signal<Notification[]>(this.loadHistory());

  constructor() {
    // Si cambia el usuario actual, cambiamos el storage key y recargamos el historial
    effect(() => {
      const key = this.computeStorageKey();
      this.storageKeyForUser.set(key);
      this.notificationHistory.set(this.loadHistory());
    });
  }

  private computeStorageKey(): string {
    const email = this.userStore.currentUser()?.email || 'guest';
    return `${this.STORAGE_KEY_BASE}__${email.toLowerCase()}`;
  }

  private loadHistory(): Notification[] {
    try {
      const stored = localStorage.getItem(this.storageKeyForUser());
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch {
      return [];
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(this.storageKeyForUser(), JSON.stringify(this.notificationHistory()));
    } catch (e) {
      console.error('Error saving notification history:', e);
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  show(
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      duration?: number;
      action?: { label: string; callback: () => void };
    }
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      duration: options?.duration ?? 5000, // 5s por defecto
      action: options?.action,
      read: false,
    };

    // Agregar a activas (toast)
    this.activeNotifications.update((notifications) => [...notifications, notification]);

    // Agregar a historial
    this.notificationHistory.update((history) => [notification, ...history]);
    this.saveHistory();

    // Auto-dismiss si tiene duración
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  success(title: string, message: string, options?: { duration?: number }) {
    return this.show('success', title, message, options);
  }

  error(title: string, message: string, options?: { duration?: number }) {
    return this.show('error', title, message, options);
  }

  warning(title: string, message: string, options?: { duration?: number }) {
    return this.show('warning', title, message, options);
  }

  info(title: string, message: string, options?: { duration?: number }) {
    return this.show('info', title, message, options);
  }

  dismiss(id: string) {
    this.activeNotifications.update((notifications) => notifications.filter((n) => n.id !== id));
  }

  dismissAll() {
    this.activeNotifications.set([]);
  }

  markAsRead(id: string) {
    this.notificationHistory.update((history) =>
      history.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    this.saveHistory();
  }

  markAllAsRead() {
    this.notificationHistory.update((history) => history.map((n) => ({ ...n, read: true })));
    this.saveHistory();
  }

  clearHistory() {
    this.notificationHistory.set([]);
    this.saveHistory();
  }

  getUnreadCount(): number {
    return this.notificationHistory().filter((n) => !n.read).length;
  }
}
