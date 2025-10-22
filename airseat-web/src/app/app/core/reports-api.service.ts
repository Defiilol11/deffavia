import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OrderByUser {
  user_email: string;
  orders_count: number;
}

export interface SeatModeInfo {
  code: string;
  mode: 'manual' | 'random' | 'imported';
}

export interface ReportSummaryResponse {
  ok: boolean;
  users: number;
  businessOcup: number;
  economyOcup: number;
  businessFree: number;
  economyFree: number;
  manual: number;
  random: number;
  imported: number;
  modificados: number;
  cancelados: number;
  reservasPorUsuario: OrderByUser[];
  seatsByMode?: SeatModeInfo[];
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  /**
   * Obtiene el resumen de reportes incluyendo información de modo por asiento.
   *
   * El backend debería incluir en la respuesta un array 'seatsByMode' con la siguiente estructura:
   *
   * SELECT ri.seat_code as code, ro.mode
   * FROM reservation_item ri
   * JOIN reservation_order ro ON ri.order_id = ro.id
   * WHERE ri.status != 'canceled'
   *
   * Esto devolverá algo como:
   * seatsByMode: [
   *   { code: 'A3', mode: 'manual' },
   *   { code: 'B4', mode: 'random' },
   *   { code: 'C5', mode: 'imported' },
   *   ...
   * ]
   */
  getSummary() {
    return this.http.get<ReportSummaryResponse>(`${this.base}/reports/summary`);
  }
}
