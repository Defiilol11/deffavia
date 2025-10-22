import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { AuthApi, ApiUser } from '../../core/auth.api';
import { ReservationsApi } from '../../core/reservations-api.service';

const LS_USER = 'auth_user';
const LS_TOKEN = 'auth_token';

@Injectable({ providedIn: 'root' })
export class UserStore {
  addReservationCounter(userEmail: string) {
    throw new Error('Method not implemented.');
  }
  private api = inject(AuthApi);
  private reservationsApi = inject(ReservationsApi);

  private loadUser(): ApiUser | null {
    try {
      return JSON.parse(localStorage.getItem(LS_USER) || 'null');
    } catch {
      return null;
    }
  }
  private loadToken(): string {
    try {
      return localStorage.getItem(LS_TOKEN) || '';
    } catch {
      return '';
    }
  }

  currentUser = signal<ApiUser | null>(this.loadUser());
  token = signal<string>(this.loadToken());

  isLoggedIn = computed(() => !!this.token());

  constructor() {
    effect(() => {
      const u = this.currentUser();
      if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
      else localStorage.removeItem(LS_USER);
    });
    effect(() => {
      const t = this.token();
      if (t) localStorage.setItem(LS_TOKEN, t);
      else localStorage.removeItem(LS_TOKEN);
    });

    // Si ya hay sesión cargada desde localStorage y no tenemos isVip definido, intentamos sincronizar
    effect(async () => {
      const user = this.currentUser();
      const token = this.token();
      if (token && user && user.email && user.isVip !== true) {
        await this.syncVipFromReservations();
      }
    });
  }

  async register(email: string, password: string) {
    // Crea usuario en API y luego inicia sesión con las mismas credenciales
    await this.api.register(email, password).toPromise();
    return this.login(email, password);
  }

  async login(email: string, password: string) {
    const resp = await this.api.login(email, password).toPromise();
    if (!resp?.ok || !resp.token) throw new Error('No se pudo iniciar sesión.');
    this.token.set(resp.token);
    this.currentUser.set(resp.user);
    // Si el backend no devolvió isVip pero ya califica por historial, sincronizamos
    await this.syncVipFromReservations();
    return resp.user;
  }

  logout() {
    this.currentUser.set(null);
    this.token.set('');
  }

  async updateProfile(payload: { email?: string; password?: string; currentPassword?: string }) {
    const user = this.currentUser();
    if (!user?.id) throw new Error('Usuario no autenticado');

    const resp = await this.api.updateUser(user.id, payload).toPromise();
    if (!resp?.ok) throw new Error('No se pudo actualizar el perfil');

    // Actualizar el usuario en el store con los nuevos datos
    this.currentUser.set(resp.user);
    return resp;
  }

  getEmail() {
    return this.currentUser()?.email || '';
  }

  // Verifica en el backend cuántas reservas tiene el usuario y marca VIP si ya califica
  private async syncVipFromReservations() {
    try {
      const user = this.currentUser();
      if (!user?.email) return;
      const resp = await this.reservationsApi.getMyReservations().toPromise();
      const items = (resp as any)?.items ?? [];
      // Contar solo activos cuando haya estado; si no existe, contar todos para no quedar cortos
      const activeCount = Array.isArray(items)
        ? items.filter((it: any) => (it?.status ? it.status !== 'canceled' : true)).length
        : 0;
      const qualifies = activeCount >= 5;
      if (qualifies && user.isVip !== true) {
        this.currentUser.set({ ...user, isVip: true });
      }
    } catch (e) {
      // Silencioso: si falla, no bloquea login ni rompe UI
      console.debug('syncVipFromReservations skipped/error:', e);
    }
  }
}
