import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ReservationMem } from '../../shared/models/reservation.model';
import { SeatDto, SeatClass } from '../../shared/models/seat.model';
import { UserStore } from '../auth/user-store.service';

function uid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

@Injectable({ providedIn: 'root' })
export class ReservationStore {
  constructor(private users: UserStore) {}

  // Estado en memoria (compatibilidad con flujos locales)
  reservations = signal<ReservationMem[]>([]);

  // Asientos ocupados localmente (activos)
  localBusyCodes = computed(
    () =>
      new Set(
        this.reservations()
          .filter((r) => r.status === 'active')
          .map((r) => r.seatCode)
      )
  );

  // Contadores para reportes locales
  countBySelection = computed(() => ({
    manual: this.reservations().filter((r) => r.selectionMode === 'manual').length,
    random: this.reservations().filter((r) => r.selectionMode === 'random').length,
  }));
  modifiedCount = computed(() => this.reservations().filter((r) => r.modifiedCount > 0).length);
  canceledCount = computed(() => this.reservations().filter((r) => r.status === 'canceled').length);

  // Helpers de precio
  private basePrice(cls: SeatClass) {
    return cls === 'business' ? environment.priceBusiness : environment.priceEconomy;
  }

  // VIP local (solo si el usuario actual coincide por email y viene con isVip del backend)
  private isVipEmail(email: string) {
    const u = this.users.currentUser();
    return !!(u && u.email?.toLowerCase() === email.toLowerCase() && (u as any).isVip);
  }

  private vipDiscount(email: string, cls: SeatClass, base: number) {
    return this.isVipEmail(email) ? +(base * 0.1).toFixed(2) : 0;
  }

  isLocallyBusy(code: string) {
    return this.localBusyCodes().has(code);
  }

  // Reserva local (para flujos en memoria o demostraciones)
  reserveOne(input: {
    userEmail: string;
    seat: SeatDto;
    passengerName: string;
    cui: string;
    hasLuggage: boolean;
    selectionMode: 'manual' | 'random';
  }) {
    const base = this.basePrice(input.seat.class);
    const discount = this.vipDiscount(input.userEmail, input.seat.class, base);
    const modifiers = 0;
    const total = +(base + modifiers - discount).toFixed(2);

    const r: ReservationMem = {
      id: uid(),
      userEmail: input.userEmail,
      seatCode: input.seat.code,
      seatClass: input.seat.class,
      passengerName: input.passengerName,
      cui: input.cui,
      hasLuggage: input.hasLuggage,
      price: base,
      modifiers,
      discount,
      total,
      status: 'active',
      reservedAt: new Date().toISOString(),
      modifiedCount: 0,
      selectionMode: input.selectionMode,
    };
    this.reservations.update((arr) => [...arr, r]);
    // Nota: ya no incrementamos contadores del usuario aquí (eso lo hace el backend real).
    return r;
  }

  // Modificar (misma clase) +10%
  modifyByCuiAndSeat(input: { cui: string; fromSeatCode: string; toSeat: SeatDto }) {
    const idx = this.reservations().findIndex(
      (r) => r.cui === input.cui && r.seatCode === input.fromSeatCode && r.status === 'active'
    );
    if (idx < 0) throw new Error('No se encontró reserva activa con ese CUI/asiento.');
    const current = this.reservations()[idx];
    if (current.seatClass !== input.toSeat.class) throw new Error('Debe ser la misma clase.');
    const inc = +(current.total * environment.modificationIncrease).toFixed(2);
    const updated: ReservationMem = {
      ...current,
      seatCode: input.toSeat.code,
      modifiers: +(current.modifiers + inc).toFixed(2),
      total: +(current.total + inc).toFixed(2),
      modifiedCount: current.modifiedCount + 1,
    };
    this.reservations.update((arr) => arr.map((r, i) => (i === idx ? updated : r)));
    return updated;
  }

  cancelByCuiAndSeat(input: { cui: string; seatCode: string }) {
    const idx = this.reservations().findIndex(
      (r) => r.cui === input.cui && r.seatCode === input.seatCode && r.status === 'active'
    );
    if (idx < 0) throw new Error('No se encontró reserva activa con ese CUI/asiento.');
    const updated = { ...this.reservations()[idx], status: 'canceled' as const };
    this.reservations.update((arr) => arr.map((r, i) => (i === idx ? updated : r)));
    return updated;
  }

  // Email “preview” local
  buildEmailHtml(email: string) {
    const list = this.reservations().filter((r) => r.userEmail === email && r.status === 'active');
    const total = list.reduce((acc, r) => acc + r.total, 0);
    return `
      <div style="font-family:ui-sans-serif,system-ui;background:#0f1115;color:#e6e9ef;padding:16px">
        <div style="max-width:680px;margin:auto;border:1px solid #2a2f3a;border-radius:12px;overflow:hidden">
          <div style="background:#dc143c;color:white;padding:16px 20px;font-weight:800">Deffavia — Confirmación de reserva</div>
          <div style="padding:16px 20px;background:#161a22">
            <p>Hola ${email},</p>
            <p>Gracias por tu reserva. Detalle:</p>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr>
                  <th style="text-align:left;padding:6px;border-bottom:1px solid #2a2f3a">Asiento</th>
                  <th style="text-align:left;padding:6px;border-bottom:1px solid #2a2f3a">Pasajero</th>
                  <th style="text-align:left;padding:6px;border-bottom:1px solid #2a2f3a">CUI</th>
                  <th style="text-align:right;padding:6px;border-bottom:1px solid #2a2f3a">Total (Q)</th>
                </tr>
              </thead>
              <tbody>
                ${list
                  .map(
                    (r) => `
                  <tr>
                    <td style="padding:6px;border-bottom:1px solid #2a2f3a">${r.seatCode}</td>
                    <td style="padding:6px;border-bottom:1px solid #2a2f3a">${r.passengerName}</td>
                    <td style="padding:6px;border-bottom:1px solid #2a2f3a">${r.cui}</td>
                    <td style="padding:6px;border-bottom:1px solid #2a2f3a;text-align:right">${r.total.toFixed(
                      2
                    )}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding:8px 6px;text-align:right;font-weight:800">Total</td>
                  <td style="padding:8px 6px;text-align:right;font-weight:800">Q ${total.toFixed(
                    2
                  )}</td>
                </tr>
              </tfoot>
            </table>
            <p style="color:#9aa3b2">Este es un correo de prueba (no enviado).</p>
          </div>
        </div>
      </div>
    `;
  }
}
