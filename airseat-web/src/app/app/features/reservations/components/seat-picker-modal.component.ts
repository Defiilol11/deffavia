import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatMapComponent, SeatClass } from '../../seats/seat-map/seat-map.component';

export interface SeatInfo {
  seat_code: string;
  seat_class: string;
  passenger_name: string;
  cui: string;
  total: number;
  has_luggage?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-seat-picker-modal',
  imports: [CommonModule, SeatMapComponent],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      (click)="cancel.emit()"
      aria-modal="true"
      role="dialog"
    >
      <!-- Modal -->
      <div
        class="w-full max-w-5xl my-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-zinc-900 dark:ring-white/10 max-h-[95vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header (fixed) -->
        <div
          class="flex items-center justify-between gap-3 rounded-t-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-3 sm:px-4 text-white shrink-0"
        >
          <div class="font-extrabold tracking-tight text-sm sm:text-base">
            {{ title || 'Elegir nuevo asiento' }}
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1 sm:gap-2 rounded-md bg-white/10 px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 shrink-0"
            (click)="cancel.emit()"
            aria-label="Cerrar selector de asientos"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-4 w-4 sm:h-5 sm:w-5"
            >
              <path
                fill-rule="evenodd"
                d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.36a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="hidden sm:inline">Cerrar</span>
          </button>
        </div>

        <!-- Body (scrollable) -->
        <div class="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 overflow-y-auto flex-1 min-h-0">
          <!-- Información del asiento actual -->
          <div
            *ngIf="currentSeatInfo"
            class="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <h3 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              📍 Asiento Actual a Modificar
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div>
                <div class="text-zinc-500 dark:text-zinc-400 mb-1">Asiento</div>
                <div class="font-bold text-violet-600 dark:text-violet-400 text-base sm:text-lg">
                  {{ currentSeatInfo.seat_code }}
                </div>
              </div>
              <div>
                <div class="text-zinc-500 dark:text-zinc-400 mb-1">Clase</div>
                <div class="font-semibold capitalize">{{ currentSeatInfo.seat_class }}</div>
              </div>
              <div class="col-span-2 sm:col-span-1">
                <div class="text-zinc-500 dark:text-zinc-400 mb-1">Pasajero</div>
                <div class="font-semibold">{{ currentSeatInfo.passenger_name }}</div>
              </div>
              <div>
                <div class="text-zinc-500 dark:text-zinc-400 mb-1">CUI</div>
                <div class="font-mono text-xs sm:text-sm">{{ currentSeatInfo.cui }}</div>
              </div>
            </div>
            <div
              class="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Equipaje:</span>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  [ngClass]="
                    currentSeatInfo.has_luggage
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                      : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                  "
                >
                  {{ currentSeatInfo.has_luggage ? 'Sí' : 'No' }}
                </span>
              </div>
              <div class="text-right">
                <div class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Total</div>
                <div class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Q {{ currentSeatInfo.total | number : '1.2-2' }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <span class="font-semibold">→</span> Selecciona el nuevo asiento disponible en la clase
            <b>{{ seatClass }}</b
            >.
          </div>
          <div class="rounded-xl border border-zinc-200 p-2 sm:p-3 dark:border-zinc-800">
            <app-seat-map
              [pickMode]="true"
              [maxSelection]="1"
              [seatClass]="seatClass"
              [extraOccupiedCodes]="[]"
              [previousSeatCode]="currentSeatInfo?.seat_code"
              [(selectedCodes)]="selected"
            ></app-seat-map>
          </div>
        </div>

        <!-- Footer (fixed) -->
        <div
          class="flex items-center justify-end gap-2 border-t border-zinc-200 px-3 py-3 sm:px-4 dark:border-zinc-800 shrink-0"
        >
          <button
            type="button"
            class="btn secondary inline-flex items-center rounded-md px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm"
            (click)="cancel.emit()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn inline-flex items-center rounded-md px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
            [disabled]="selected.length !== 1"
            (click)="confirm()"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SeatPickerModalComponent {
  @Input() title = '';
  @Input() seatClass: SeatClass = 'economy';
  @Input() currentSeatInfo: SeatInfo | null = null;
  @Output() pick = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  selected: string[] = [];

  confirm() {
    if (this.selected.length === 1) this.pick.emit(this.selected[0]);
  }
}
