import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationsApi } from '../../../core/reservations-api.service';
import { SeatPickerModalComponent } from '../components/seat-picker-modal.component';

@Component({
  standalone: true,
  selector: 'app-my-reservations',
  imports: [CommonModule, SeatPickerModalComponent],
  template: `
    <section class="panel" style="display:grid;gap:1rem">
      <h2 style="margin:0">Mis reservas</h2>

      <div *ngIf="loading">Cargando…</div>
      <div *ngIf="err" class="help" style="color:#b91c1c">{{ err }}</div>

      <ng-container *ngFor="let o of orders; trackBy: trackOrder">
        <div class="panel">
          <div
            style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap"
          >
            <div>
              <b>Reserva #{{ o.id }}</b>
              <span
                class="badge"
                [style.background]="o.status === 'active' ? '#dcfce7' : '#fee2e2'"
                >{{ o.status }}</span
              >
              <div class="help">Creada: {{ o.reserved_at | date : 'short' }}</div>
            </div>
            <div style="text-align:right">
              <div>Subtotal: Q {{ o.price_subtotal | number : '1.2-2' }}</div>
              <div>Descuento: Q {{ o.discount_total | number : '1.2-2' }}</div>
              <div>Recargos: Q {{ o.modifiers_total | number : '1.2-2' }}</div>
              <div>
                <b>Total: Q {{ o.total | number : '1.2-2' }}</b>
              </div>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-top:.5rem">
            <thead>
              <tr>
                <th style="text-align:left;padding:6px;border-bottom:1px solid var(--border)">
                  Asiento
                </th>
                <th style="text-align:left;padding:6px;border-bottom:1px solid var(--border)">
                  Clase
                </th>
                <th style="text-align:left;padding:6px;border-bottom:1px solid var(--border)">
                  Pasajero
                </th>
                <th style="text-align:left;padding:6px;border-bottom:1px solid var(--border)">
                  CUI
                </th>
                <th style="text-align:right;padding:6px;border-bottom:1px solid var(--border)">
                  Total (Q)
                </th>
                <th style="text-align:right;padding:6px;border-bottom:1px solid var(--border)">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let i of itemsByOrder[o.id]; trackBy: trackItem">
                <td style="padding:6px;border-bottom:1px solid var(--border)">{{ i.seat_code }}</td>
                <td style="padding:6px;border-bottom:1px solid var(--border)">
                  {{ i.seat_class }}
                </td>
                <td style="padding:6px;border-bottom:1px solid var(--border)">
                  {{ i.passenger_name }}
                </td>
                <td style="padding:6px;border-bottom:1px solid var(--border)">{{ i.cui }}</td>
                <td style="padding:6px;border-bottom:1px solid var(--border);text-align:right">
                  {{ i.total | number : '1.2-2' }}
                </td>
                <td style="padding:6px;border-bottom:1px solid var(--border);text-align:right">
                  <button
                    class="btn ghost"
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

          <div style="margin-top:.5rem;display:flex;gap:.5rem;justify-content:flex-end">
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
      (cancel)="closePicker()"
      (pick)="confirmPicker($event)"
    >
    </app-seat-picker-modal>
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
