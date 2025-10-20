import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SeatMapComponent, SeatClass } from '../../seats/seat-map/seat-map.component';
import { validateCui } from '../../../shared/utils/cui.util';
import { EmailService } from '../../../core/email.service';
import { ApiService } from '../../../core/api.service';
import { UserStore } from '../../auth/user-store.service';
import {
  ReservationsApi,
  CreateSelection,
  CreateOrderPayload,
} from '../../../core/reservations-api.service';

type SeatRow = { code: string; class: SeatClass; seat_status: 'active' | 'free' };

type PersistedRow = {
  itemId: number;
  orderId: number;
  seatCode: string;
  seatClass: SeatClass;
  passengerName: string;
  cui: string;
  total: number;
};

@Component({
  standalone: true,
  selector: 'app-reservation-wizard',
  imports: [CommonModule, ReactiveFormsModule, SeatMapComponent],
  template: `
    <section class="panel" style="display:grid;gap:1rem">
      <h2 style="margin:0">Reservar asientos</h2>
      <div class="help">
        Debes estar autenticado para crear reservas. Estás logueado como
        <strong>{{ userEmail }}</strong
        >.
      </div>

      <!-- Paso 1 -->
      <form [formGroup]="cfgForm" (ngSubmit)="continueCfg()" class="panel">
        <div class="field-row">
          <div class="field">
            <label class="label">Cantidad</label>
            <input
              class="input"
              type="number"
              min="1"
              formControlName="count"
              [class.invalid]="cfgForm.controls.count.invalid && cfgForm.controls.count.touched"
            />
          </div>
          <div class="field">
            <label class="label">Clase</label>
            <select class="input" formControlName="seatClass">
              <option value="business">Negocios</option>
              <option value="economy">Económica</option>
            </select>
          </div>
          <div class="field">
            <label class="label">Modo</label>
            <select class="input" formControlName="mode">
              <option value="manual">Selección manual</option>
              <option value="random">Aleatoria (servidor)</option>
            </select>
          </div>
        </div>

        <div
          *ngIf="availabilityChecked()"
          class="help"
          [style.color]="canProceed() ? '#15803d' : '#b91c1c'"
        >
          Disponibles en {{ cfgForm.value.seatClass }}: <strong>{{ availableCount() }}</strong> ·
          Requeridos: <strong>{{ cfgForm.value.count }}</strong>
        </div>
        <div *ngIf="availError" class="help" style="color:#b91c1c">{{ availError }}</div>

        <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn" type="submit" [disabled]="cfgForm.invalid || !canProceed()">
            Continuar
          </button>
          <button class="btn ghost" type="button" (click)="checkAvailability()">
            Revisar disponibilidad
          </button>
        </div>
      </form>

      <!-- Paso 2: selección manual -->
      <div
        *ngIf="step() === 2 && cfgForm.value.mode === 'manual'"
        class="panel"
        style="display:grid;gap:1rem"
      >
        <div class="badge">
          Selecciona {{ requiredCount() }} asiento(s) libres. Disponibles: {{ availableCount() }}
        </div>
        <app-seat-map
          [pickMode]="true"
          [maxSelection]="cfgForm.value.count || 1"
          [seatClass]="cfgForm.value.seatClass || 'economy'"
          [extraOccupiedCodes]="localOccupied"
          [(selectedCodes)]="selectedCodes"
        >
        </app-seat-map>

        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button
            class="btn"
            type="button"
            [disabled]="selectedCodes.length !== (cfgForm.value.count || 1)"
            (click)="goToPassengersManual()"
          >
            Continuar
          </button>
          <button class="btn secondary" type="button" (click)="resetSelection()">Reiniciar</button>
        </div>
      </div>

      <!-- Paso 3: datos por asiento -->
      <div *ngIf="step() === 3" class="panel">
        <form [formGroup]="passengerForm" (ngSubmit)="confirmOne()">
          <div class="field-row">
            <div class="field">
              <label class="label">
                {{
                  cfgForm.value.mode === 'manual'
                    ? 'Pasajero — ' + currentSeatCode()
                    : 'Pasajero ' + (randomIndex() + 1) + '/' + (cfgForm.value.count || 1)
                }}
              </label>
              <input
                class="input"
                formControlName="name"
                placeholder="Nombre Apellido"
                [class.invalid]="
                  passengerForm.controls.name.invalid && passengerForm.controls.name.touched
                "
              />
            </div>
            <div class="field">
              <label class="label">CUI</label>
              <input
                class="input"
                formControlName="cui"
                placeholder="13 dígitos"
                [class.invalid]="!!cuiError && passengerForm.controls.cui.touched"
              />
              <div class="help" *ngIf="cuiError" style="color:#b91c1c">{{ cuiError }}</div>
            </div>
            <div class="field">
              <label class="label">¿Llevará maleta?</label>
              <select class="input" formControlName="hasLuggage">
                <option [ngValue]="true">Sí</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
          </div>

          <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="btn" type="submit" [disabled]="passengerForm.invalid">Confirmar</button>
            <button class="btn ghost" type="button" (click)="skipCurrent()">Saltar</button>
          </div>
        </form>
        <p class="help" style="margin-top:.5rem" *ngIf="lastMessage">{{ lastMessage }}</p>
      </div>

      <!-- Paso 4: resumen -->
      <div *ngIf="step() === 4" class="panel">
        <h3 style="margin-top:0">Resumen de la reserva #{{ orderId }}</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px;border-bottom:1px solid var(--border)">
                Asiento
              </th>
              <th style="text-align:left;padding:6px;border-bottom:1px solid var(--border)">
                Pasajero
              </th>
              <th style="text-align:left;padding:6px;border-bottom:1px solid var(--border)">CUI</th>
              <th style="text-align:right;padding:6px;border-bottom:1px solid var(--border)">
                Total (Q)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of reservedPersisted">
              <td style="padding:6px;border-bottom:1px solid var(--border)">{{ r.seatCode }}</td>
              <td style="padding:6px;border-bottom:1px solid var(--border)">
                {{ r.passengerName }}
              </td>
              <td style="padding:6px;border-bottom:1px solid var(--border)">{{ r.cui }}</td>
              <td style="padding:6px;border-bottom:1px solid var(--border);text-align:right">
                {{ r.total | number : '1.2-2' }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:8px 6px;text-align:right;font-weight:800">Total</td>
              <td style="padding:8px 6px;text-align:right;font-weight:800">
                Q {{ grandTotal | number : '1.2-2' }}
              </td>
            </tr>
          </tfoot>
        </table>

        <div class="help" style="margin-top:.5rem">
          El correo de confirmación fue enviado automáticamente por el servidor al crear la reserva.
          Puedes reenviarlo como prueba:
        </div>
        <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn ghost" (click)="showEmailPreview()">Ver correo (preview)</button>
          <button class="btn" (click)="sendEmail()" [disabled]="sending">Reenviar correo</button>
          <span class="help" *ngIf="sending">Enviando…</span>
          <span class="help" style="color:#15803d" *ngIf="sendOk">{{ sendOk }}</span>
          <span class="help" style="color:#b91c1c" *ngIf="sendErr">{{ sendErr }}</span>
        </div>

        <div *ngIf="emailHtml" class="panel" style="margin-top:1rem">
          <h4>Vista previa del correo para {{ userEmail }}</h4>
          <iframe
            [srcdoc]="emailHtml"
            style="width:100%;height:360px;border:1px solid var(--border);border-radius:8px;background:#fff"
          ></iframe>
        </div>
      </div>
    </section>
  `,
})
export class ReservationWizardComponent {
  private fb = inject(FormBuilder);
  private email = inject(EmailService);
  private api = inject(ApiService);
  private users = inject(UserStore);
  private reservationsApi = inject(ReservationsApi);

  userEmail = this.users.currentUser()?.email || '';

  step = signal<1 | 2 | 3 | 4>(1);

  cfgForm = this.fb.group({
    count: [1, [Validators.required, Validators.min(1)]],
    seatClass: ['economy' as SeatClass, Validators.required],
    mode: ['manual' as 'manual' | 'random', Validators.required],
  });

  availableCount = signal<number>(0);
  availabilityChecked = signal<boolean>(false);
  availError = '';
  requiredCount = signal<number>(1);

  localOccupied: string[] = [];
  selectedCodes: string[] = [];

  passengerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    cui: ['', [Validators.required]],
    hasLuggage: [false, [Validators.required]],
  });
  currentSeatCode = signal<string>('');
  randomIndex = signal<number>(0);
  lastMessage = '';
  cuiError = '';

  reservedDraft: CreateSelection[] = []; // manual
  randomPassengers: Array<{ passengerName: string; cui: string; hasLuggage: boolean }> = []; // random
  orderId: number | null = null;
  reservedPersisted: PersistedRow[] = [];
  grandTotal = 0;

  emailHtml = '';
  sending = false;
  sendOk = '';
  sendErr = '';

  canProceed() {
    const req = this.cfgForm.value.count || 1;
    return this.availabilityChecked() && this.availableCount() >= req;
  }

  async checkAvailability() {
    this.availError = '';
    this.availabilityChecked.set(false);
    try {
      const rows = await this.api.get<SeatRow[]>('/seats').toPromise();
      const { seatClass, count } = this.cfgForm.getRawValue();
      const occupiedGlobal = new Set(
        rows!.filter((x) => x.seat_status === 'active').map((x) => x.code)
      );
      for (const c of this.localOccupied) occupiedGlobal.add(c);
      const freeByClass = rows!
        .filter((x) => x.class === seatClass && !occupiedGlobal.has(x.code))
        .map((x) => x.code);
      this.availableCount.set(freeByClass.length);
      this.requiredCount.set(count || 1);
      this.availabilityChecked.set(true);

      if ((count || 1) > freeByClass.length) {
        this.availError = `No hay suficientes asientos. Libres: ${freeByClass.length}, requeridos: ${count}.`;
      }
      return { freeByClass };
    } catch {
      this.availError = 'No se pudieron obtener asientos. Verifica la API.';
      this.availableCount.set(0);
      this.availabilityChecked.set(true);
      return { freeByClass: [] as string[] };
    }
  }

  async continueCfg() {
    const { count, seatClass, mode } = this.cfgForm.getRawValue();
    if (!count || !seatClass || !mode) return;
    const { freeByClass } = await this.checkAvailability();
    if (count > freeByClass.length) return;

    if (mode === 'manual') {
      this.selectedCodes = [];
      this.step.set(2);
      return;
    }
    // random (server-side): pasar directamente a capturar pasajeros
    this.randomPassengers = [];
    this.randomIndex.set(0);
    this.step.set(3);
  }

  resetSelection() {
    const { count } = this.cfgForm.getRawValue();
    this.selectedCodes = [];
    this.requiredCount.set(count || 1);
  }

  goToPassengersManual() {
    if (this.selectedCodes.length !== (this.cfgForm.value.count || 1)) {
      alert('Selecciona todos los asientos requeridos.');
      return;
    }
    this.reservedDraft = [];
    this.currentSeatCode.set(this.selectedCodes[0]);
    this.step.set(3);
  }

  skipCurrent() {
    if (this.cfgForm.value.mode === 'manual') {
      const i = this.selectedCodes.indexOf(this.currentSeatCode());
      const nextIdx = (i + 1) % this.selectedCodes.length;
      this.currentSeatCode.set(this.selectedCodes[nextIdx]);
    } else {
      const i = this.randomIndex();
      const count = this.cfgForm.value.count || 1;
      this.randomIndex.set((i + 1) % count);
    }
  }

  confirmOne() {
    this.cuiError = '';
    const f = this.passengerForm.getRawValue();
    const v = validateCui(f.cui || '');
    if (!v.valid) {
      this.cuiError = v.reason ?? '';
      return;
    }

    if (this.cfgForm.value.mode === 'manual') {
      const seatCode = this.currentSeatCode();
      this.reservedDraft.push({
        seatCode,
        passengerName: f.name!,
        cui: f.cui!,
        hasLuggage: !!f.hasLuggage,
      });
      this.localOccupied = Array.from(new Set([...this.localOccupied, seatCode]));
      const remaining = this.selectedCodes.filter((c) => c !== seatCode);
      const when = new Date().toLocaleString();
      this.lastMessage = `Reservado (borrador) asiento ${seatCode} el ${when}.`;

      if (remaining.length) {
        this.selectedCodes = remaining;
        this.currentSeatCode.set(remaining[0]);
        this.passengerForm.reset({ name: '', cui: '', hasLuggage: false });
      } else {
        this.persistAll();
      }
    } else {
      // random: solo acumulamos pasajeros
      this.randomPassengers.push({
        passengerName: f.name!,
        cui: f.cui!,
        hasLuggage: !!f.hasLuggage,
      });
      const when = new Date().toLocaleString();
      this.lastMessage = `Pasajero ${this.randomPassengers.length} agregado el ${when}.`;

      if (this.randomPassengers.length < (this.cfgForm.value.count || 1)) {
        this.randomIndex.set(this.randomPassengers.length);
        this.passengerForm.reset({ name: '', cui: '', hasLuggage: false });
      } else {
        this.persistAll();
      }
    }
  }

  private persistAll() {
    const mode = this.cfgForm.value.mode || 'manual';
    const count = this.cfgForm.value.count || 1;
    const seatClass = this.cfgForm.value.seatClass || 'economy';

    let payload: CreateOrderPayload;
    if (mode === 'manual') {
      payload = {
        userEmail: this.userEmail,
        mode: 'manual',
        selections: this.reservedDraft,
      };
    } else {
      payload = {
        userEmail: this.userEmail,
        mode: 'random',
        random: {
          seatClass,
          count,
          passengers: this.randomPassengers,
        },
      };
    }

    this.reservationsApi.createOrder(payload).subscribe({
      next: (resp) => {
        this.orderId = resp.orderId;
        const items = resp.items ?? (resp as any).reservations ?? [];
        this.reservedPersisted = items.map((it: any) => {
          // buscar datos locales por CUI
          const m =
            mode === 'manual'
              ? this.reservedDraft.find((d) => d.cui === it.cui)
              : this.randomPassengers.find((d) => d.cui === it.cui);
          return {
            itemId: it.id,
            orderId: resp.orderId,
            seatCode: it.seatCode,
            seatClass: it.seatClass,
            passengerName: m?.passengerName || it.passengerName || '',
            cui: m?.cui || it.cui || '',
            total: it.total,
          };
        });
        this.grandTotal = this.reservedPersisted.reduce((acc, x) => acc + (x.total || 0), 0);

        // preview (el backend ya envió el correo)
        this.emailHtml = this.email.buildQuoteHtml(
          this.userEmail,
          this.reservedPersisted.map(
            (x) =>
              ({
                id: String(x.itemId),
                userEmail: this.userEmail,
                seatCode: x.seatCode,
                seatClass: x.seatClass,
                passengerName: x.passengerName,
                cui: x.cui,
                hasLuggage: false,
                price: 0,
                modifiers: 0,
                discount: 0,
                total: x.total,
                status: 'active',
                reservedAt: new Date().toISOString(),
                modifiedCount: 0,
                selectionMode: mode!,
              } as any)
          )
        );
        this.step.set(4);
      },
      error: (e) => {
        alert(`Error al crear la reserva: ${e?.error?.error || e.message}`);
      },
    });
  }

  showEmailPreview() {
    if (!this.emailHtml && this.reservedPersisted.length) {
      this.emailHtml = this.email.buildQuoteHtml(
        this.userEmail,
        this.reservedPersisted.map(
          (x) =>
            ({
              id: String(x.itemId),
              userEmail: this.userEmail,
              seatCode: x.seatCode,
              seatClass: x.seatClass,
              passengerName: x.passengerName,
              cui: x.cui,
              hasLuggage: false,
              price: 0,
              modifiers: 0,
              discount: 0,
              total: x.total,
              status: 'active',
              reservedAt: new Date().toISOString(),
              modifiedCount: 0,
              selectionMode: this.cfgForm.value.mode!,
            } as any)
        )
      );
    }
  }

  sendEmail() {
    this.sendOk = '';
    this.sendErr = '';
    this.sending = true;
    const html = this.emailHtml;
    this.email.sendQuoteViaApi(this.userEmail, html).subscribe({
      next: () => {
        this.sending = false;
        this.sendOk = 'Correo enviado correctamente.';
      },
      error: (e) => {
        this.sending = false;
        this.sendErr = `Error al enviar: ${e?.error?.error || e.message || 'desconocido'}`;
      },
    });
  }
}
