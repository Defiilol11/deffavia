import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationsApi } from '../../../core/reservations-api.service';
import { SeatPickerModalComponent } from '../components/seat-picker-modal.component';

@Component({
  standalone: true,
  selector: 'app-my-reservations',
  imports: [CommonModule, SeatPickerModalComponent],
  template: `
    <section class="panel grid gap-4">
      <div class="flex items-end justify-between gap-3 flex-wrap">
        <h2 class="m-0 text-2xl font-bold tracking-tight">Mis reservas</h2>
        <button class="btn ghost" type="button" (click)="refresh()">Actualizar</button>
      </div>

      <!-- Estados -->
      <div *ngIf="loading" class="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div class="h-5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
        <div class="mt-3 grid gap-2">
          <div class="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
          <div class="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
      </div>
      <div *ngIf="!loading && err" class="text-sm font-medium text-red-600 dark:text-red-400">
        {{ err }}
      </div>
      <div
        *ngIf="!loading && !err && !orders.length"
        class="panel text-sm text-zinc-600 dark:text-zinc-300"
      >
        Aún no tienes reservas. Crea una desde el asistente.
      </div>

      <!-- Listado de reservas -->
      <ng-container *ngFor="let o of orders; trackBy: trackOrder">
        <div class="panel">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 text-sm">
                <span class="font-semibold">Reserva #{{ o.id }}</span>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  [ngClass]="{
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300':
                      o.status === 'active',
                    'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300':
                      o.status !== 'active'
                  }"
                >
                  {{ o.status }}
                </span>
              </div>
              <div class="help">Creada: {{ o.reserved_at | date : 'short' }}</div>
            </div>
            <div class="text-right text-sm">
              <div>Subtotal: Q {{ o.price_subtotal | number : '1.2-2' }}</div>
              <div>Descuento: Q {{ o.discount_total | number : '1.2-2' }}</div>
              <div>Recargos: Q {{ o.modifiers_total | number : '1.2-2' }}</div>
              <div class="text-base font-bold">Total: Q {{ o.total | number : '1.2-2' }}</div>
            </div>
          </div>

          <div class="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table class="min-w-full border-separate border-spacing-0">
              <thead class="bg-zinc-50 text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-semibold">Asiento</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold">Clase</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold">Pasajero</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold">CUI</th>
                  <th class="px-3 py-2 text-right text-xs font-semibold">Total (Q)</th>
                  <th class="px-3 py-2 text-right text-xs font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-zinc-900 dark:text-zinc-100">
                <tr
                  *ngFor="let i of itemsByOrder[o.id]; trackBy: trackItem"
                  class="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <td class="px-3 py-2 align-middle font-medium">{{ i.seat_code }}</td>
                  <td class="px-3 py-2 align-middle capitalize">{{ i.seat_class }}</td>
                  <td class="px-3 py-2 align-middle">{{ i.passenger_name }}</td>
                  <td class="px-3 py-2 align-middle">{{ i.cui }}</td>
                  <td class="px-3 py-2 align-middle text-right">
                    {{ i.total | number : '1.2-2' }}
                  </td>
                  <td class="px-3 py-2 align-middle text-right">
                    <button
                      class="btn ghost mr-1"
                      [disabled]="o.status !== 'active' || i.status !== 'active'"
                      (click)="openPicker(o, i)"
                    >
                      Modificar
                    </button>
                    <button
                      class="btn secondary"
                      [disabled]="o.status !== 'active' || i.status !== 'active'"
                      (click)="cancelItem(o, i)"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 flex items-center justify-end gap-2">
            <button class="btn" [disabled]="o.status !== 'active'" (click)="cancelOrder(o)">
              Cancelar reserva completa
            </button>
          </div>
        </div>
      </ng-container>
    </section>

    <!-- Modal selector de asiento -->
    <app-seat-picker-modal
      *ngIf="showPicker"
      [title]="'Elegir asiento (clase ' + (pickerFor?.seat_class || '') + ')'"
      [seatClass]="pickerFor?.seat_class || 'economy'"
      [currentSeatInfo]="pickerFor"
      (cancel)="closePicker()"
      (pick)="confirmPicker($event)"
    />
  `,
})
export class MyReservationsComponent {
  private api = inject(ReservationsApi);

  loading = false;
  err = '';
  orders: any[] = [];
  itemsByOrder: Record<number, any[]> = {};

  showPicker = false;
  pickerOrder: any | null = null;
  pickerFor: any | null = null;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.err = '';
    this.api.getMyReservations().subscribe({
      next: (resp) => {
        this.loading = false;
        this.orders = resp.orders || [];
        this.itemsByOrder = {};
        for (const i of resp.items || []) {
          (this.itemsByOrder[i.order_id] ||= []).push(i);
        }
      },
      error: (e) => {
        this.loading = false;
        this.err = e?.error?.error || e.message || 'Error';
      },
    });
  }

  openPicker(o: any, i: any) {
    this.pickerOrder = o;
    this.pickerFor = i;
    this.showPicker = true;
  }
  closePicker() {
    this.showPicker = false;
    this.pickerFor = null;
    this.pickerOrder = null;
  }
  confirmPicker(newSeatCode: string) {
    if (!this.pickerOrder || !this.pickerFor) return;
    this.api
      .modifyItem(
        this.pickerOrder.id,
        this.pickerFor.id,
        newSeatCode.toUpperCase(),
        this.pickerFor.cui
      )
      .subscribe({
        next: () => {
          this.closePicker();
          this.refresh();
        },
        error: (e) => alert(e?.error?.error || e.message),
      });
  }

  cancelItem(o: any, i: any) {
    if (!confirm(`Cancelar el asiento ${i.seat_code}?`)) return;
    this.api.cancelItem(o.id, i.id, i.cui).subscribe({
      next: () => this.refresh(),
      error: (e) => alert(e?.error?.error || e.message),
    });
  }
  cancelOrder(o: any) {
    if (!confirm(`Cancelar la reserva #${o.id} completa?`)) return;
    this.api.cancelOrder(o.id).subscribe({
      next: () => this.refresh(),
      error: (e) => alert(e?.error?.error || e.message),
    });
  }

  trackOrder = (_: number, o: any) => o.id;
  trackItem = (_: number, i: any) => i.id;
}
