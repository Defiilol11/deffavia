import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type SeatClass = 'business' | 'economy';

export interface CreateSelection {
  seatCode: string;
  passengerName: string;
  cui: string;
  hasLuggage: boolean;
}

// Payload manual
export interface CreateOrderPayloadManual {
  userEmail: string;
  mode: 'manual';
  selections: CreateSelection[];
}

// Payload aleatorio (server-side)
export interface CreateOrderPayloadRandom {
  userEmail: string;
  mode: 'random';
  random: {
    seatClass: SeatClass;
    count: number;
    passengers: Array<{ passengerName: string; cui: string; hasLuggage: boolean }>;
  };
}

export type CreateOrderPayload = CreateOrderPayloadManual | CreateOrderPayloadRandom;

export interface CreatedOrderResponse {
  ok: boolean;
  orderId: number;
  isVip: boolean;
  subtotal: number;
  discountTotal: number;
  total: number;
  items: Array<{
    id: number;
    seatCode: string;
    seatClass: SeatClass;
    passengerName: string;
    cui: string;
    total: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class ReservationsApi {
  private http = inject(HttpClient);

  createOrder(payload: CreateOrderPayload) {
    return this.http.post<CreatedOrderResponse>('/api/reservations', payload);
  }

  getMyReservations() {
    return this.http.get<{ ok: boolean; orders: any[]; items: any[] }>('/api/reservations/my');
  }

  modifyItem(orderId: number, itemId: number, newSeatCode: string, cui: string) {
    return this.http.patch<{ ok: boolean; increment: number; from: string; to: string }>(
      `/api/reservations/${orderId}/items/${itemId}/seat`,
      { newSeatCode, cui }
    );
  }

  cancelItem(orderId: number, itemId: number, cui: string) {
    return this.http.post<{ ok: boolean }>(`/api/reservations/${orderId}/items/${itemId}/cancel`, {
      cui,
    });
  }

  cancelOrder(orderId: number) {
    return this.http.post<{ ok: boolean }>(`/api/reservations/${orderId}/cancel`, {});
  }
}
