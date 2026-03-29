import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SeatClass, SeatMapComponent } from '../../seats/seat-map/seat-map.component';
import { validateCui, maskCui } from '../../../shared/utils/cui.util';
import { UserStore } from '../../auth/user-store.service';
import { ReservationsApi, CreateOrderPayloadGroup } from '../../../core/reservations-api.service';
import { NotificationService } from '../../../core/notification.service';

@Component({
  standalone: true,
  selector: 'app-group-reservation',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-6">
          <h1
            class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent"
          >
            Reserva Grupal
          </h1>
          <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Reserva múltiples asientos contiguos para tu grupo
          </p>
        </div>

        <!-- Paso 1: Configuración del grupo -->
        <div *ngIf="step() === 1" class="space-y-6">
          <div
            class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Configuración del Grupo
            </h2>
            <form [formGroup]="configForm" (ngSubmit)="continueToPassengers()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Nombre del grupo
                  </label>
                  <input
                    type="text"
                    formControlName="groupName"
                    placeholder="Familia García"
                    class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Cantidad de personas
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    formControlName="count"
                    class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Descuento: {{ groupDiscountText() }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Clase de asiento
                  </label>
                  <select
                    formControlName="seatClass"
                    class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="economy">Económica</option>
                    <option value="business">Negocios</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requireContiguous"
                  formControlName="requireContiguous"
                  class="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                <label
                  for="requireContiguous"
                  class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Requerir asientos contiguos (juntos)
                </label>
              </div>

              <!-- Preview de opciones disponibles -->
              <div *ngIf="contiguousOptions() && contiguousOptions()!.length > 0" class="mt-4">
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Opciones disponibles:
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div
                    *ngFor="let option of contiguousOptions()"
                    class="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Fila {{ option.row }}
                      </span>
                      <span class="text-xs font-medium text-violet-600 dark:text-violet-400">
                        Q{{ option.totalPrice | number : '1.2-2' }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        *ngFor="let seat of option.seats"
                        class="inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      >
                        {{ seat }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="configError()" class="text-sm text-rose-600 dark:text-rose-400">
                {{ configError() }}
              </div>

              <div class="flex gap-2">
                <button
                  type="submit"
                  [disabled]="configForm.invalid || loading()"
                  class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading() ? 'Cargando...' : 'Continuar' }}
                </button>
                <button
                  type="button"
                  (click)="checkAvailability()"
                  [disabled]="configForm.invalid || loading()"
                  class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                >
                  Ver opciones
                </button>
                <button
                  type="button"
                  (click)="goBack()"
                  class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
        <!-- Paso 2: CUIs del grupo -->
        <div *ngIf="step() === 2" class="space-y-6">
          <div
            class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">CUIs del Grupo</h2>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Grupo: <strong>{{ configForm.value.groupName }}</strong> ·
              {{ configForm.value.count }} personas · Clase: {{ configForm.value.seatClass }}
            </p>

            <form [formGroup]="cuiListForm" (ngSubmit)="submitReservation()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Ingresa los CUIs de los pasajeros
                </label>
                <textarea
                  formControlName="cuis"
                  rows="4"
                  placeholder="Ingresa {{
                    configForm.value.count
                  }} CUIs separados por espacio, coma o punto y coma"
                  class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                ></textarea>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Ejemplo: 1234567890101 1029384756101 9988776655443
                  <br />
                  También puedes separarlos con coma o punto y coma.
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  type="submit"
                  [disabled]="cuiListForm.invalid || submitting()"
                  class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ submitting() ? 'Procesando...' : 'Confirmar Reserva' }}
                </button>
                <button
                  type="button"
                  (click)="backToConfig()"
                  [disabled]="submitting()"
                  class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Volver
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class GroupReservationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userStore = inject(UserStore);
  private reservationsApi = inject(ReservationsApi);
  private notifications = inject(NotificationService);

  step = signal(1);
  loading = signal(false);
  submitting = signal(false);
  cuiListForm = this.fb.nonNullable.group({
    cuis: ['', Validators.required],
  });
  configError = signal('');
  contiguousOptions = signal<Array<{ row: string; seats: string[]; totalPrice: number }>>([]);
  private retriedWithoutContiguous = false;

  configForm = this.fb.nonNullable.group({
    groupName: ['', Validators.required],
    count: [2, [Validators.required, Validators.min(2), Validators.max(20)]],
    seatClass: ['economy' as SeatClass, Validators.required],
    requireContiguous: [true],
  });

  passengersForm = this.fb.nonNullable.group({
    passengers: this.fb.array([]),
  });

  get passengers() {
    return this.passengersForm.get('passengers') as FormArray;
  }

  groupDiscountText = computed(() => {
    const count = this.configForm.controls.count.value;
    if (count >= 10) return '15% de descuento';
    if (count >= 5) return '10% de descuento';
    return 'Sin descuento';
  });

  checkAvailability() {
    const { seatClass, count } = this.configForm.getRawValue();
    this.loading.set(true);
    this.configError.set('');

    this.reservationsApi.getContiguousSeats(seatClass, count).subscribe({
      next: (resp) => {
        this.loading.set(false);
        if (resp.available && resp.options.length > 0) {
          this.contiguousOptions.set(resp.options);
          this.notifications.success(
            'Disponibilidad',
            `${resp.options.length} opciones encontradas`
          );
        } else {
          this.configError.set('No hay suficientes asientos contiguos disponibles');
          this.notifications.warning(
            'Sin opciones',
            'No hay asientos contiguos disponibles para tu grupo'
          );
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.configError.set(err.error?.error || 'Error al verificar disponibilidad');
        this.notifications.error('Error', 'No se pudo verificar la disponibilidad');
      },
    });
  }

  continueToPassengers() {
    if (this.configForm.invalid) return;
    this.step.set(2);
  }

  setAsLeader(index: number) {
    // Solo un líder a la vez
    this.passengers.controls.forEach((control, i) => {
      if (i !== index) {
        control.patchValue({ isLeader: false });
      }
    });
  }

  submitReservation() {
    if (this.cuiListForm.invalid) return;

    const user = this.userStore.currentUser();
    if (!user?.email) {
      this.notifications.error('Error', 'Debes estar autenticado');
      return;
    }

    const config = this.configForm.getRawValue();
    const cuiListRaw = this.cuiListForm.controls.cuis.value;
    const cuis = cuiListRaw
      .split(/\s|,|;/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cuis.length !== config.count) {
      this.notifications.error('Error', `Debes ingresar exactamente ${config.count} CUIs.`);
      return;
    }

    const invalidCui = cuis.find((cui) => !validateCui(cui).valid);
    if (invalidCui) {
      this.notifications.error('Error', `CUI inválido: ${invalidCui}`);
      return;
    }

    const passengersData = cuis.map((cui, i) => ({
      // Usamos el CUI enmascarado como nombre del pasajero para que aparezca en el asiento
      passengerName: maskCui(cui),
      cui,
      hasLuggage: false,
      isLeader: i === 0,
    }));

    const payload: CreateOrderPayloadGroup = {
      userEmail: user.email,
      mode: 'group',
      group: {
        seatClass: config.seatClass,
        count: config.count,
        requireContiguous: config.requireContiguous,
        groupName: config.groupName,
        passengers: passengersData,
      },
    };

    this.retriedWithoutContiguous = false;
    this.submitting.set(true);

    this.reservationsApi.createOrder(payload).subscribe({
      next: (resp) => {
        this.submitting.set(false);
        this.notifications.success(
          '¡Reserva grupal exitosa!',
          `Orden #${resp.orderId} creada. ${
            resp.groupDiscount ? `Descuento: ${resp.groupDiscount}%` : ''
          }`
        );
        // Reflejar VIP si aplica
        const wasVip = !!this.userStore.currentUser()?.isVip;
        if (resp.isVip && !wasVip) {
          const u = this.userStore.currentUser();
          if (u) this.userStore.currentUser.set({ ...u, isVip: true });
          this.notifications.success(
            '¡Felicidades, ahora eres VIP! 👑',
            'Tienes 10% de descuento en todas tus reservas desde ahora.'
          );
        }
        this.router.navigate(['/reservations/my']);
      },
      error: (err) => {
        const message: string = err?.error?.error || err?.message || '';
        // Fallback: si falla por FOR UPDATE + GROUP BY, reintentar sin contiguidad
        if (
          !this.retriedWithoutContiguous &&
          message.includes('FOR UPDATE is not allowed with GROUP BY')
        ) {
          this.retriedWithoutContiguous = true;
          const fallbackPayload: CreateOrderPayloadGroup = {
            ...payload,
            group: { ...payload.group, requireContiguous: false },
          };
          this.notifications.warning(
            'Sin contiguidad',
            'No se lograron asientos contiguos. Intentaremos reservar sin contiguidad.'
          );
          this.reservationsApi.createOrder(fallbackPayload).subscribe({
            next: (resp2) => {
              this.submitting.set(false);
              this.notifications.success(
                '¡Reserva grupal exitosa!',
                `Orden #${resp2.orderId} creada sin asientos contiguos.`
              );
              // Reflejar VIP si aplica
              const wasVip = !!this.userStore.currentUser()?.isVip;
              if (resp2.isVip && !wasVip) {
                const u = this.userStore.currentUser();
                if (u) this.userStore.currentUser.set({ ...u, isVip: true });
                this.notifications.success(
                  '¡Felicidades, ahora eres VIP! 👑',
                  'Tienes 10% de descuento en todas tus reservas desde ahora.'
                );
              }
              this.router.navigate(['/reservations/my']);
            },
            error: (err2) => {
              this.submitting.set(false);
              this.notifications.error(
                'Error en reserva',
                err2?.error?.error || 'No se pudo completar la reserva grupal'
              );
            },
          });
          return;
        }

        this.submitting.set(false);
        this.notifications.error(
          'Error en reserva',
          message || 'No se pudo completar la reserva grupal'
        );
      },
    });
  }

  backToConfig() {
    this.step.set(1);
  }

  goBack() {
    this.router.navigate(['/reservations/wizard']);
  }
}
