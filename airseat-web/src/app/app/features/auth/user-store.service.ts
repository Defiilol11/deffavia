import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { AuthApi, ApiUser } from '../../core/auth.api';

const LS_USER = 'auth_user';
const LS_TOKEN = 'auth_token';

@Injectable({ providedIn: 'root' })
export class UserStore {
  addReservationCounter(userEmail: string) {
    throw new Error('Method not implemented.');
  }
  private api = inject(AuthApi);

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
    return resp.user;
  }

  logout() {
    this.currentUser.set(null);
    this.token.set('');
  }

  getEmail() {
    return this.currentUser()?.email || '';
  }
}
