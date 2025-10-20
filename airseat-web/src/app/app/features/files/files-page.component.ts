import { Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesApi, ImportResult } from '../../core/files-api.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-files-page',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="panel" style="display:grid;gap:1rem">
      <h2 style="margin:0">Exportar / Importar reservas (XML)</h2>

      <div class="panel" style="display:grid;gap:.75rem">
        <h3 style="margin:0">Exportar</h3>
        <p class="help">Descarga un archivo XML con todas las reservas activas.</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn" (click)="export()">Descargar XML</button>
          <span class="help" *ngIf="downloading">Generando…</span>
          <span class="help" style="color:#b91c1c" *ngIf="errExport">{{ errExport }}</span>
        </div>
      </div>

      <div class="panel" style="display:grid;gap:.75rem">
        <h3 style="margin:0">Importar</h3>
        <p class="help">
          Carga un archivo XML previamente generado. El sistema procesará cada asiento, reportando
          errores y éxitos; al finalizar podrás ver el mapa de asientos actualizado.
        </p>

        <input type="file" accept=".xml,text/xml" (change)="onFile($event)" />
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem">
          <button class="btn" [disabled]="!file || importing" (click)="import()">Importar</button>
          <span class="help" *ngIf="importing">Procesando…</span>
        </div>

        <div *ngIf="result" class="panel" style="margin-top:.5rem">
          <h4 style="margin:0 0 .25rem 0">Resultado de importación</h4>
          <ul style="margin:0;padding-left:1rem">
            <li>Leídos: {{ result.readCount ?? '?' }}</li>
            <li>Éxitos: {{ result.successCount ?? '?' }}</li>
            <li>Errores: {{ result.errorCount ?? 0 }}</li>
            <li>Tiempo: {{ result.elapsedMs ?? 0 }} ms</li>
          </ul>
          <div *ngIf="result.errors?.length">
            <h5>Errores</h5>
            <ol>
              <li *ngFor="let e of result.errors">
                <code>{{ e.seatCode || '¿?' }} / {{ e.cui || '¿?' }}:</code>
                <span> {{ e.message || 'Error' }}</span>
              </li>
            </ol>
          </div>

          <div style="margin-top:.5rem">
            <a class="btn ghost" routerLink="/seats">Ver diagrama de asientos</a>
          </div>
        </div>

        <span class="help" style="color:#b91c1c" *ngIf="errImport">{{ errImport }}</span>
      </div>
    </section>
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

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files && input.files[0] ? input.files[0] : null;
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
