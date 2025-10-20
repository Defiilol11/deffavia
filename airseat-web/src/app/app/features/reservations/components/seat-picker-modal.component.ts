import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatMapComponent, SeatClass } from '../../seats/seat-map/seat-map.component';

@Component({
  standalone: true,
  selector: 'app-seat-picker-modal',
  imports: [CommonModule, SeatMapComponent],
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        width: min(92vw, 880px);
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 24px 96px rgba(0, 0, 0, 0.32);
        overflow: hidden;
      }
      .header {
        padding: 12px 16px;
        background: #7c3aed;
        color: #fff;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .body {
        padding: 12px 16px;
      }
      .footer {
        padding: 12px 16px;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        border-top: 1px solid #eee;
      }
    `,
  ],
  template: `
    <div class="backdrop" (click)="cancel.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="header">
          <div>{{ title || 'Elegir nuevo asiento' }}</div>
          <button class="btn ghost" (click)="cancel.emit()">Cerrar</button>
        </div>
        <div class="body">
          <app-seat-map
            [pickMode]="true"
            [maxSelection]="1"
            [seatClass]="seatClass"
            [extraOccupiedCodes]="[]"
            [(selectedCodes)]="selected"
          >
          </app-seat-map>
        </div>
        <div class="footer">
          <button class="btn secondary" (click)="cancel.emit()">Cancelar</button>
          <button class="btn" [disabled]="selected.length !== 1" (click)="confirm()">
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
