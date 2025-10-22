import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesApi, ImportResult } from '../../core/files-api.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-files-page',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <section
        class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-md"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Exportar / Importar reservas (XML)
            </h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Gestiona las reservas mediante archivos XML generados por el sistema.
            </p>
          </div>
          <button
            (click)="export()"
            class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            [disabled]="downloading"
          >
            <svg
              *ngIf="!downloading"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            <svg
              *ngIf="downloading"
              class="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
              <path class="opacity-75" stroke-width="4" d="M4 12a8 8 0 018-8"></path>
            </svg>
            <span>{{ downloading ? 'Generando…' : 'Descargar XML' }}</span>
          </button>
        </div>

        <div
          *ngIf="errExport"
          class="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 text-sm"
        >
          {{ errExport }}
        </div>
      </section>

      <!-- Import card -->
      <section
        class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-md"
      >
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Importar</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Carga un archivo XML previamente generado. El sistema procesará cada asiento y reportará
          resultados.
        </p>

        <!-- Dropzone -->
        <div
          class="mt-4 border-2 border-dashed rounded-xl p-6 text-center transition-colors"
          [class.border-purple-400]="isDragOver"
          [class.bg-purple-50]="isDragOver"
          [class.dark:border-purple-700]="isDragOver"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <div class="flex flex-col items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Arrastra y suelta el archivo aquí, o
              <label
                class="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                explora en tu equipo
                <input
                  type="file"
                  accept=".xml,text/xml"
                  class="sr-only"
                  (change)="onFile($event)"
                />
              </label>
            </div>

            <div
              *ngIf="file"
              class="w-full max-w-sm mx-auto mt-2 text-left bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center justify-between gap-2"
            >
              <span class="truncate">{{ file.name }}</span>
              <button
                type="button"
                (click)="clearFile()"
                class="text-gray-500 hover:text-red-600"
                aria-label="Quitar archivo"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            [disabled]="!file || importing"
            (click)="import()"
          >
            <svg
              *ngIf="!importing"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v12m0 0l-3-3m3 3l3-3M4 20h16"
              />
            </svg>
            <svg
              *ngIf="importing"
              class="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
              <path class="opacity-75" stroke-width="4" d="M4 12a8 8 0 018-8"></path>
            </svg>
            <span>{{ importing ? 'Procesando…' : 'Importar' }}</span>
          </button>

          <a
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            routerLink="/seats"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
            Ver diagrama de asientos
          </a>
        </div>

        <!-- Errors -->
        <div
          *ngIf="errImport"
          class="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 text-sm"
        >
          {{ errImport }}
        </div>

        <!-- Result -->
        <div
          *ngIf="result"
          class="mt-6 bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-600 rounded-xl p-4"
        >
          <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Resultado de importación
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              class="rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-3 text-center"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400">Leídos</div>
              <div class="text-lg font-bold text-gray-900 dark:text-white">
                {{ result.readCount ?? '?' }}
              </div>
            </div>
            <div
              class="rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-3 text-center"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400">Éxitos</div>
              <div class="text-lg font-bold text-green-600">{{ result.successCount ?? '?' }}</div>
            </div>
            <div
              class="rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-3 text-center"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400">Errores</div>
              <div class="text-lg font-bold text-red-600">{{ result.errorCount ?? 0 }}</div>
            </div>
            <div
              class="rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-3 text-center"
            >
              <div class="text-xs text-gray-500 dark:text-gray-400">Tiempo</div>
              <div class="text-lg font-bold text-gray-900 dark:text-white">
                {{ result.elapsedMs ?? 0 }} ms
              </div>
            </div>
          </div>

          <div *ngIf="result.errors?.length" class="mt-4">
            <h5 class="font-semibold text-gray-900 dark:text-white mb-2">Errores</h5>
            <ul class="space-y-2">
              <li
                *ngFor="let e of result.errors"
                class="text-sm text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2"
              >
                <code class="text-purple-600 dark:text-purple-400"
                  >{{ e.seatCode || '¿?' }} / {{ e.cui || '¿?' }}</code
                >
                <span class="ml-1">{{ e.message || 'Error' }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class FilesPageComponent {
  private api = inject(FilesApi);

  file: File | null = null;
  downloading = false;
  importing = false;
  errExport = '';
  errImport = '';
  result: ImportResult | null = null;
  isDragOver = false;

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files && input.files[0] ? input.files[0] : null;
  }

  clearFile() {
    this.file = null;
  }

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(ev: DragEvent) {
    ev.preventDefault();
    this.isDragOver = false;
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.isDragOver = false;
    if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) {
      const file = ev.dataTransfer.files[0];
      if (file && (file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml'))) {
        this.file = file;
      }
    }
  }

  export() {
    this.errExport = '';
    this.downloading = true;
    this.api.exportXml().subscribe({
      next: (blob) => {
        this.downloading = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        a.href = url;
        a.download = `reservas-${ts}.xml`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: (e) => {
        this.downloading = false;
        this.errExport = e?.error?.error || e.message || 'Error al exportar';
      },
    });
  }

  import() {
    if (!this.file) return;
    this.errImport = '';
    this.result = null;
    this.importing = true;
    this.api.importXml(this.file).subscribe({
      next: (res) => {
        this.importing = false;
        this.result = res || { ok: true };
      },
      error: (e) => {
        this.importing = false;
        this.errImport = e?.error?.error || e.message || 'Error al importar';
      },
    });
  }
}
