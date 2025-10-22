import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';

export type SeatClass = 'business' | 'economy';
type SeatStatus = 'active' | 'free';

interface SeatDto {
  id: number;
  code: string;
  class: SeatClass;
  seat_status: SeatStatus;
}
interface SeatCell {
  code: string;
  class: SeatClass;
  occupied: boolean;
}

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-map.component.html',
  styleUrls: ['./seat-map.component.scss'],
})
export class SeatMapComponent implements OnInit, OnChanges {
  constructor(private api: ApiService) {}

  // Selección
  @Input() pickMode = false;
  @Input() maxSelection = 1;
  @Input() seatClass?: SeatClass;

  // Ocupados extra (reservas locales mientras se confirma)
  @Input() extraOccupiedCodes: string[] = [];

  // Two-way selection
  @Input() selectedCodes: string[] = [];
  @Output() selectedCodesChange = new EventEmitter<string[]>();

  // Layout ordenado por clase (como tu diagrama)
  businessRows = ['I', 'G', 'F', 'D', 'C', 'A'];
  businessCols = [1, 2];

  economyRows = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  economyCols = [3, 4, 5, 6, 7];
  // Usaremos la lista completa (economy) para alinear filas entre zonas
  allRows = this.economyRows;

  // Separadores entre subgrupos de filas
  private businessBreaks = new Set(['G', 'D']); // (I,G) | (F,D) | (C,A)
  private economyBreaks = new Set(['G', 'D']); // (I,H,G) | (F,E,D) | (C,B,A)

  seats = signal<Map<string, SeatCell>>(new Map());

  ngOnInit() {
    this.loadFromApi();
  }
  ngOnChanges(ch: SimpleChanges): void {
    if (ch['extraOccupiedCodes']) this.markOccupied();
  }

  private loadFromApi() {
    this.api.get<SeatDto[]>('/seats').subscribe((rows) => {
      const m = new Map<string, SeatCell>();
      for (const r of rows) {
        m.set(r.code, { code: r.code, class: r.class, occupied: r.seat_status === 'active' });
      }
      this.seats.set(m);
      this.markOccupied();
    });
  }

  private markOccupied() {
    if (!this.extraOccupiedCodes?.length) return;
    const m = new Map(this.seats());
    for (const code of this.extraOccupiedCodes) {
      const cell = m.get(code);
      if (cell) m.set(code, { ...cell, occupied: true });
    }
    this.seats.set(m);
  }

  getSeat(row: string, col: number): SeatCell | undefined {
    return this.seats().get(`${row}${col}`);
  }

  isRightClass(s: SeatCell) {
    return !this.seatClass || this.seatClass === s.class;
  }
  isSelected(s: SeatCell) {
    return this.selectedCodes.includes(s.code);
  }
  canPick(s: SeatCell) {
    return (
      this.pickMode &&
      this.isRightClass(s) &&
      !s.occupied &&
      // permitir seleccionar si aún hay cupo
      ((!this.isSelected(s) && this.selectedCodes.length < this.maxSelection) ||
        // permitir deseleccionar con un click si ya está seleccionado
        this.isSelected(s))
    );
  }

  onClick(row: string, col: number) {
    const s = this.getSeat(row, col);
    if (!s || !this.pickMode) return;
    // Toggle: si está seleccionado, quitarlo; si no, agregar si hay cupo
    if (this.isSelected(s)) {
      const next = this.selectedCodes.filter((c) => c !== s.code);
      this.selectedCodes = next;
      this.selectedCodesChange.emit(next);
      return;
    }
    if (!this.canPick(s)) return;
    const next = [...this.selectedCodes, s.code];
    this.selectedCodes = next;
    this.selectedCodesChange.emit(next);
  }

  onDblClick(row: string, col: number) {
    const s = this.getSeat(row, col);
    if (!s || !this.isSelected(s)) return;
    const next = this.selectedCodes.filter((c) => c !== s.code);
    this.selectedCodes = next;
    this.selectedCodesChange.emit(next);
  }

  onKeyDown(ev: KeyboardEvent, row: string, col: number) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.onClick(row, col);
    }
  }

  // Separador después de ciertas filas (para espaciado de bloques)
  sepAfterBusinessRow(r: string) {
    return this.businessBreaks.has(r);
  }
  sepAfterEconomyRow(r: string) {
    return this.economyBreaks.has(r);
  }

  hasBusinessRow(r: string) {
    return this.businessRows.includes(r);
  }

  // trackBy helpers
  trackStr = (_: number, v: string) => v;
  trackNum = (_: number, v: number) => v;
}
