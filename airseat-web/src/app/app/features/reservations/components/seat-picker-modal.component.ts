import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatMapComponent, SeatClass } from '../../seats/seat-map/seat-map.component';

@Component({
  standalone: true,
  selector: 'app-seat-picker-modal',
  imports: [CommonModule, SeatMapComponent],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      (click)="cancel.emit()"
      aria-modal="true"
      role="dialog"
    >
      <!-- Modal -->
      <div
        class="w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-zinc-900 dark:ring-white/10"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between gap-3 rounded-t-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white"
        >
          <div class="font-extrabold tracking-tight">
            {{ title || 'Elegir nuevo asiento' }}
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            (click)="cancel.emit()"
            aria-label="Cerrar selector de asientos"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.36a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z"
                clip-rule="evenodd"
              />
            </svg>
            Cerrar
          </button>
        </div>

        <!-- Body -->
        <div class="px-4 py-4 sm:px-6">
          <div class="mb-3 text-sm text-zinc-600 dark:text-zinc-300">
            Selecciona exactamente un asiento disponible en la clase <b>{{ seatClass }}</b
            >.
          </div>
          <div class="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <app-seat-map
              [pickMode]="true"
              [maxSelection]="1"
              [seatClass]="seatClass"
              [extraOccupiedCodes]="[]"
              [(selectedCodes)]="selected"
            ></app-seat-map>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800"
        >
          <button
            type="button"
            class="btn secondary inline-flex items-center rounded-md px-3 py-2 text-sm"
            (click)="cancel.emit()"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn inline-flex items-center rounded-md px-3 py-2 text-sm disabled:opacity-50"
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
  @Output() pick = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  selected: string[] = [];

  confirm() {
    if (this.selected.length === 1) this.pick.emit(this.selected[0]);
  }
}
