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

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  currentPassword?: string;
}

export interface UpdateUserResponse {
  ok: boolean;
  user: ApiUser;
  updated: {
    email: boolean;
    password: boolean;
  };
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

  updateUser(userId: number | string, payload: UpdateUserPayload) {
    return this.http.patch<UpdateUserResponse>(`/api/users/${userId}`, payload);
  }
}
