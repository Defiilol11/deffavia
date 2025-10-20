import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ApiUser {
  id: number | string;
  email: string;
  isVip?: boolean;
}

export interface LoginResponse {
  ok: boolean;
  token: string;
  user: ApiUser;
}

export interface RegisterResponse {
  ok: boolean;
  user: ApiUser;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);

  register(email: string, password: string) {
    return this.http.post<RegisterResponse>('/api/users', { email, password });
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password });
  }
}
