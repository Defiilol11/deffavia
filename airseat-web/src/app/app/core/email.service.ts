import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReservationMem } from '../shared/models/reservation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private http = inject(HttpClient);

  buildQuoteHtml(toEmail: string, list: ReservationMem[]) {
    const total = list.reduce((acc, r) => acc + r.total, 0);
    return `
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <style>
      :root {
        --bg: #ffffff;
        --panel: #ffffff;
        --border: #e5e7eb;
        --text: #111827;
        --text-weak: #4b5563;
        --muted: #6b7280;

        --accent-yellow: #ffd166;
        --accent-pink:   #ef476f;
        --accent-purple: #7c3aed;

        --focus-ring: rgba(124, 58, 237, .35);
      }

      body {
        margin:0; padding:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        background: var(--bg);
        color: var(--text);
      }

      .wrap {
        max-width:700px;
        margin:24px auto;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 8px 24px rgba(0,0,0,.08);
        border:1px solid var(--border);
        background: var(--panel);
      }

      .head {
        background: linear-gradient(90deg, var(--accent-purple), var(--accent-pink));
        color: #fff;
        padding: 20px 24px;
        font-weight:800;
        font-size:1.4rem;
        text-align:center;
        position:relative;
      }

      .head::after {
        content: "✈️";
        position:absolute;
        right:16px;
        top:50%;
        transform: translateY(-50%);
        font-size:1.6rem;
      }

      .body {
        padding:20px 24px;
      }

      p { margin:0 0 16px 0; line-height:1.5; }

      table {
        width:100%;
        border-collapse: collapse;
        margin-top:10px;
      }

      th, td {
        padding:12px 8px;
        border-bottom:1px solid var(--border);
        text-align:left;
        font-size:.95rem;
      }

      th {
        background: #f9fafb;
        font-weight:600;
        color: var(--text-weak);
      }

      tfoot td {
        font-weight:800;
      }

      .muted {
        color: var(--muted);
        font-size:.85rem;
        margin-top:20px;
      }

      .btn {
        display:inline-block;
        background: var(--accent-yellow);
        color:#111827;
        font-weight:700;
        padding: 10px 18px;
        border-radius: 10px;
        text-decoration:none;
        margin-top:20px;
      }
      .btn:hover { filter: brightness(0.95); }

    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">Deffavia — Cotización de vuelo</div>
      <div class="body">
        <p>Hola <strong>${toEmail}</strong>,</p>
        <p>¡Tu aventura aérea te espera! Aquí está el detalle de tu cotización:</p>
        <table>
          <thead>
            <tr>
              <th>Asiento</th><th>Pasajero</th><th>CUI</th><th style="text-align:right">Total (Q)</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                (r) => `
                  <tr>
                    <td>${r.seatCode}</td>
                    <td>${r.passengerName}</td>
                    <td>${r.cui}</td>
                    <td style="text-align:right">${r.total.toFixed(2)}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right">Total</td>
              <td style="text-align:right">Q ${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <p class="muted">Este es un correo de prueba. Para envío real, usa el botón “Enviar correo”.</p>
        <a class="btn" href="#">Ver mi reserva</a>
      </div>
    </div>
  </body>
  </html>
  `;
  }

  // Envío real vía tu API
  sendQuoteViaApi(toEmail: string, html: string, subject = 'Deffavia — Cotización de reserva') {
    return this.http.post(environment.mailEndpoint, { toEmail, html, subject });
  }
}
