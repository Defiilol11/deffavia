import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportResult {
  ok: boolean;
  readCount?: number;
  successCount?: number;
  errorCount?: number;
  elapsedMs?: number;
  errors?: Array<{ index?: number; seatCode?: string; cui?: string; message?: string }>;
  // el backend puede incluir otros campos: assignedCodes, warnings, etc.
}

@Injectable({ providedIn: 'root' })
export class FilesApi {
  private http = inject(HttpClient);

  // Descarga el XML como Blob
  exportXml(params?: Record<string, string | number | boolean>): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get('/api/files/export-xml', { responseType: 'blob' });
  }

  // Sube un XML para procesarlo
  importXml(file: File): Observable<ImportResult> {
    const form = new FormData();
    form.append('file', file); // si tu backend espera otro nombre de campo, cámbialo aquí
    return this.http.post<ImportResult>('/api/files/import-xml', form);
  }
}
