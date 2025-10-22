const nodemailer = require('nodemailer');

const APP_NAME = process.env.APP_NAME || 'Deffavia';
const BRAND_PRIMARY = process.env.BRAND_PRIMARY || '#7c3aed';
const BRAND_BG = process.env.BRAND_BG || '#0f1115';
const BRAND_PANEL = process.env.BRAND_PANEL || '#161a22';
const BRAND_BORDER = process.env.BRAND_BORDER || '#2a2f3a';
const TEXT_COLOR = process.env.TEXT_COLOR || '#e6e9ef';
const LOGO_URL = process.env.LOGO_URL || ''; // opcional
const MAIL_FROM = process.env.MAIL_FROM || `"${APP_NAME}" <no-reply@deffavia.local>`;

// Transport con fallback a Ethereal si faltan credenciales
async function getTransport() {
  const haveRealCreds = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const forceEthereal = /^true$/i.test(process.env.USE_ETHEREAL || '');
  if (forceEthereal || !haveRealCreds) {
    const testAccount = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    return { transport, ethereal: true };
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return { transport, ethereal: false };
}

function headerBrand() {
  const logo = LOGO_URL
    ? `<img src="${LOGO_URL}" alt="${APP_NAME}" style="height:32px;vertical-align:middle;margin-right:12px;border-radius:6px" />`
    : '';
  return `${logo}<span style="font-weight:700;font-size:18px;letter-spacing:-0.02em">${APP_NAME}</span>`;
}

function layout(title, bodyHtml) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:${BRAND_BG};color:${TEXT_COLOR}">
    <div style="background:${BRAND_BG};padding:40px 20px">
      <div style="max-width:600px;margin:0 auto;background:${BRAND_PANEL};border:1px solid ${BRAND_BORDER};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3)">

        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${BRAND_PRIMARY} 0%, #6d28d9 100%);color:white;padding:28px 32px;text-align:left">
          <div style="display:inline-flex;align-items:center;margin-bottom:8px">
            ${headerBrand()}
          </div>
          <h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-0.02em">${title}</h1>
        </div>

        <!-- Body -->
        <div style="padding:32px;background:${BRAND_PANEL};line-height:1.7;font-size:15px">
          ${bodyHtml}
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px;background:rgba(0,0,0,0.2);border-top:1px solid ${BRAND_BORDER};color:#94a3b8;font-size:13px;text-align:center">
          <p style="margin:0;line-height:1.6">
            Este correo fue enviado automáticamente por <strong style="color:#cbd5e1">${APP_NAME}</strong><br>
            <span style="color:#64748b">No responder a esta dirección.</span>
          </p>
        </div>

      </div>

      <!-- Extra Footer Info -->
      <div style="max-width:600px;margin:20px auto 0;text-align:center;color:#64748b;font-size:12px">
        <p style="margin:0">© ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.</p>
      </div>
    </div>
  </body>
  </html>`;
}

function money(q) { return Number(q || 0).toFixed(2); }

function itemsTable(items) {
  return `
  <div style="margin:24px 0;overflow-x:auto">
    <table style="width:100%;border-collapse:separate;border-spacing:0;background:rgba(0,0,0,0.2);border-radius:8px;overflow:hidden">
      <thead>
        <tr style="background:rgba(124,58,237,0.15)">
          <th style="text-align:left;padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#a78bfa;border-bottom:2px solid ${BRAND_BORDER}">Asiento</th>
          <th style="text-align:left;padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#a78bfa;border-bottom:2px solid ${BRAND_BORDER}">Pasajero</th>
          <th style="text-align:left;padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#a78bfa;border-bottom:2px solid ${BRAND_BORDER}">CUI</th>
          <th style="text-align:right;padding:14px 16px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#a78bfa;border-bottom:2px solid ${BRAND_BORDER}">Total (Q)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((x, i) => `
        <tr style="background:${i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent'}">
          <td style="padding:14px 16px;border-bottom:1px solid ${BRAND_BORDER};font-weight:600;color:#c4b5fd">${x.seatCode}</td>
          <td style="padding:14px 16px;border-bottom:1px solid ${BRAND_BORDER}">${x.passengerName}</td>
          <td style="padding:14px 16px;border-bottom:1px solid ${BRAND_BORDER};color:#94a3b8;font-size:14px">${x.cui}</td>
          <td style="padding:14px 16px;border-bottom:1px solid ${BRAND_BORDER};text-align:right;font-weight:600;color:#10b981">Q ${money(x.total)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// 1) Bienvenida/registro de usuario
function buildUserCreatedHtml({ email }) {
  const body = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:rgba(124,58,237,0.15);padding:20px;border-radius:50%;margin-bottom:16px">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${BRAND_PRIMARY}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    </div>

    <p style="font-size:16px;color:${TEXT_COLOR};margin:0 0 16px 0">Hola <strong style="color:#c4b5fd">${email}</strong>,</p>

    <p style="margin:0 0 16px 0;color:#cbd5e1">
      ¡Bienvenido/a a <strong style="color:${BRAND_PRIMARY}">${APP_NAME}</strong>! Tu cuenta fue creada exitosamente.
    </p>

    <div style="background:rgba(16,185,129,0.1);border-left:4px solid #10b981;padding:16px;border-radius:8px;margin:24px 0">
      <p style="margin:0;color:#6ee7b7;font-size:14px">
        ✓ Ya puedes iniciar sesión y comenzar a reservar tus asientos.
      </p>
    </div>

    <div style="text-align:center;margin-top:32px">
      <a href="#" style="display:inline-block;background:${BRAND_PRIMARY};color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;box-shadow:0 4px 12px rgba(124,58,237,0.4)">
        Iniciar Sesión
      </a>
    </div>`;
  return layout('¡Cuenta creada exitosamente!', body);
}

// 2) Confirmación de reserva
function buildOrderCreatedHtml(order, items) {
  const body = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:rgba(16,185,129,0.15);padding:20px;border-radius:50%;margin-bottom:16px">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>

    <p style="font-size:16px;color:${TEXT_COLOR};margin:0 0 16px 0">Hola <strong style="color:#c4b5fd">${order.userEmail}</strong>,</p>

    <p style="margin:0 0 24px 0;color:#cbd5e1">
      Tu reserva fue creada exitosamente. A continuación encontrarás los detalles:
    </p>

    <div style="background:rgba(124,58,237,0.1);border:1px solid ${BRAND_BORDER};border-radius:12px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Número de Reserva</p>
      <p style="margin:0;font-size:28px;font-weight:700;color:${BRAND_PRIMARY}">#${order.orderId}</p>
    </div>

    <h2 style="font-size:18px;font-weight:600;margin:32px 0 16px 0;color:#c4b5fd">Detalles de los Asientos</h2>
    ${itemsTable(items)}

    <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:24px;margin:24px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;color:#94a3b8;font-size:15px">Subtotal</td>
          <td style="padding:8px 0;text-align:right;font-size:15px">Q ${money(order.subtotal ?? order.price_subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#94a3b8;font-size:15px">Descuento</td>
          <td style="padding:8px 0;text-align:right;font-size:15px;color:#10b981">-Q ${money(order.discountTotal)}</td>
        </tr>
        <tr style="border-top:2px solid ${BRAND_BORDER}">
          <td style="padding:16px 0 0 0;color:#c4b5fd;font-size:18px;font-weight:600">Total</td>
          <td style="padding:16px 0 0 0;text-align:right;font-size:24px;font-weight:700;color:#10b981">Q ${money(order.total)}</td>
        </tr>
      </table>
    </div>

    <div style="background:rgba(59,130,246,0.1);border-left:4px solid #3b82f6;padding:16px;border-radius:8px;margin:24px 0">
      <p style="margin:0;color:#93c5fd;font-size:14px">
        💡 <strong>Recuerda:</strong> Guarda este número de reserva para futuras consultas.
      </p>
    </div>`;
  return layout('Confirmación de Reserva', body);
}

// 3) Modificación de asiento (+10%)
function buildItemModifiedHtml({ orderId, from, to, increment, oldItemTotal, newItemTotal, orderTotal }) {
  const body = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:rgba(251,146,60,0.15);padding:20px;border-radius:50%;margin-bottom:16px">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </div>
    </div>

    <p style="font-size:16px;color:${TEXT_COLOR};margin:0 0 16px 0">
      Se ha modificado un asiento de tu reserva.
    </p>

    <div style="background:rgba(124,58,237,0.1);border:1px solid ${BRAND_BORDER};border-radius:12px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Reserva</p>
      <p style="margin:0 0 20px 0;font-size:24px;font-weight:700;color:${BRAND_PRIMARY}">#${orderId}</p>

      <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:20px">
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <span style="font-size:20px;font-weight:600;color:#ef4444;text-decoration:line-through">${from}</span>
          <span style="color:#94a3b8;font-size:24px">→</span>
          <span style="font-size:20px;font-weight:600;color:#10b981">${to}</span>
        </div>
      </div>
    </div>

    <div style="background:rgba(251,146,60,0.1);border-left:4px solid #fb923c;padding:16px;border-radius:8px;margin:24px 0">
      <p style="margin:0;color:#fdba74;font-size:14px">
        ⚠️ <strong>Recargo aplicado:</strong> +Q ${money(increment)} por cambio de asiento
      </p>
    </div>

    <h2 style="font-size:18px;font-weight:600;margin:32px 0 16px 0;color:#c4b5fd">Detalle del Costo</h2>
    <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:24px;margin:24px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;color:#94a3b8;font-size:15px">Total anterior del asiento</td>
          <td style="padding:8px 0;text-align:right;font-size:15px;color:#94a3b8;text-decoration:line-through">Q ${money(oldItemTotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#94a3b8;font-size:15px">Recargo por cambio (+10%)</td>
          <td style="padding:8px 0;text-align:right;font-size:15px;color:#fb923c">+Q ${money(increment)}</td>
        </tr>
        <tr style="border-top:2px solid ${BRAND_BORDER}">
          <td style="padding:16px 0 8px 0;color:#c4b5fd;font-size:16px;font-weight:600">Nuevo total del asiento</td>
          <td style="padding:16px 0 8px 0;text-align:right;font-size:18px;font-weight:700;color:#10b981">Q ${money(newItemTotal)}</td>
        </tr>
        <tr style="border-top:2px solid ${BRAND_BORDER}">
          <td style="padding:16px 0 0 0;color:#c4b5fd;font-size:18px;font-weight:700">Total de la orden</td>
          <td style="padding:16px 0 0 0;text-align:right;font-size:24px;font-weight:700;color:#10b981">Q ${money(orderTotal)}</td>
        </tr>
      </table>
    </div>`;
  return layout('Modificación de Asiento', body);
}

// 4) Cancelación de asiento
function buildItemCanceledHtml({ orderId, seatCode }) {
  const body = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:rgba(239,68,68,0.15);padding:20px;border-radius:50%;margin-bottom:16px">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
    </div>

    <p style="font-size:16px;color:${TEXT_COLOR};margin:0 0 16px 0">
      Se ha cancelado un asiento de tu reserva.
    </p>

    <div style="background:rgba(124,58,237,0.1);border:1px solid ${BRAND_BORDER};border-radius:12px;padding:20px;margin:24px 0">
      <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Reserva</p>
      <p style="margin:0 0 20px 0;font-size:24px;font-weight:700;color:${BRAND_PRIMARY}">#${orderId}</p>

      <div style="background:rgba(239,68,68,0.1);border-radius:8px;padding:20px;text-align:center">
        <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8">Asiento Cancelado</p>
        <span style="font-size:28px;font-weight:700;color:#ef4444">${seatCode}</span>
      </div>
    </div>

    <div style="background:rgba(239,68,68,0.1);border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:24px 0">
      <p style="margin:0;color:#fca5a5;font-size:14px">
        ℹ️ Si tienes preguntas sobre esta cancelación, contáctanos.
      </p>
    </div>`;
  return layout('Cancelación de Asiento', body);
}

// 5) Cancelación de reserva completa
function buildOrderCanceledHtml({ orderId }) {
  const body = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:rgba(239,68,68,0.15);padding:20px;border-radius:50%;margin-bottom:16px">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </div>
    </div>

    <p style="font-size:16px;color:${TEXT_COLOR};margin:0 0 16px 0">
      Tu reserva ha sido cancelada completamente.
    </p>

    <div style="background:rgba(239,68,68,0.1);border:2px solid #ef4444;border-radius:12px;padding:32px;margin:24px 0;text-align:center">
      <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Reserva Cancelada</p>
      <p style="margin:0;font-size:32px;font-weight:700;color:#ef4444">#${orderId}</p>
    </div>

    <div style="background:rgba(59,130,246,0.1);border-left:4px solid #3b82f6;padding:16px;border-radius:8px;margin:24px 0">
      <p style="margin:0;color:#93c5fd;font-size:14px">
        💬 Si necesitas realizar una nueva reserva, no dudes en contactarnos.
      </p>
    </div>`;
  return layout('Reserva Cancelada', body);
}

async function sendMailGeneric(toEmail, subject, html) {
  const { transport, ethereal } = await getTransport();
  const info = await transport.sendMail({ from: MAIL_FROM, to: toEmail, subject, html });
  if (ethereal) {
    const preview = nodemailer.getTestMessageUrl(info);
    console.log('[Ethereal preview]', preview);
  }
}

module.exports = {
  buildUserCreatedHtml,
  buildOrderCreatedHtml,
  buildItemModifiedHtml,
  buildItemCanceledHtml,
  buildOrderCanceledHtml,
  sendMailGeneric
};
