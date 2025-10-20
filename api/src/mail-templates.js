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
  const logo = LOGO_URL ? `<img src="${LOGO_URL}" alt="${APP_NAME}" style="height:28px;vertical-align:middle;margin-right:10px" />` : '';
  return `${logo}<span style="font-weight:800">${APP_NAME}</span>`;
}

function layout(title, bodyHtml) {
  return `
  <div style="font-family:ui-sans-serif,system-ui;background:${BRAND_BG};color:${TEXT_COLOR};padding:16px">
    <div style="max-width:680px;margin:auto;border:1px solid ${BRAND_BORDER};border-radius:12px;overflow:hidden">
      <div style="background:${BRAND_PRIMARY};color:white;padding:14px 18px;font-weight:800;display:flex;align-items:center;gap:8px">
        ${headerBrand()} — ${title}
      </div>
      <div style="padding:16px 18px;background:${BRAND_PANEL};line-height:1.55">
        ${bodyHtml}
      </div>
      <div style="padding:10px 16px;background:${BRAND_PANEL};border-top:1px solid ${BRAND_BORDER};color:#9aa4b2;font-size:12px">
        Este correo fue enviado automáticamente por ${APP_NAME}. No responder a esta dirección.
      </div>
    </div>
  </div>`;
}

function money(q) { return Number(q || 0).toFixed(2); }

function itemsTable(items) {
  return `
  <table style="width:100%;border-collapse:collapse;margin-top:6px">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px;border-bottom:1px solid ${BRAND_BORDER}">Asiento</th>
        <th style="text-align:left;padding:6px;border-bottom:1px solid ${BRAND_BORDER}">Pasajero</th>
        <th style="text-align:left;padding:6px;border-bottom:1px solid ${BRAND_BORDER}">CUI</th>
        <th style="text-align:right;padding:6px;border-bottom:1px solid ${BRAND_BORDER}">Total (Q)</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(x => `
        <tr>
          <td style="padding:6px;border-bottom:1px solid ${BRAND_BORDER}">${x.seatCode}</td>
          <td style="padding:6px;border-bottom:1px solid ${BRAND_BORDER}">${x.passengerName}</td>
          <td style="padding:6px;border-bottom:1px solid ${BRAND_BORDER}">${x.cui}</td>
          <td style="padding:6px;border-bottom:1px solid ${BRAND_BORDER};text-align:right">${money(x.total)}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

// 1) Bienvenida/registro de usuario
function buildUserCreatedHtml({ email }) {
  const body = `
    <p>Hola ${email},</p>
    <p>Tu cuenta en <b>${APP_NAME}</b> fue creada exitosamente.</p>
    <p>Puedes iniciar sesión y comenzar a reservar asientos.</p>`;
  return layout('Cuenta creada', body);
}

// 2) Confirmación de reserva
function buildOrderCreatedHtml(order, items) {
  const body = `
    <p>Hola ${order.userEmail},</p>
    <p>Tu reserva <b>#${order.orderId}</b> fue creada.</p>
    ${itemsTable(items)}
    <p style="text-align:right;margin-top:.5rem">
      Subtotal: Q ${money(order.subtotal ?? order.price_subtotal)}<br>
      Descuento: Q ${money(order.discountTotal)}<br>
      <b>Total: Q ${money(order.total)}</b>
    </p>`;
  return layout('Confirmación de reserva', body);
}

// 3) Modificación de asiento (+10%)
function buildItemModifiedHtml({ orderId, from, to, increment }) {
  const body = `
    <p>Se modificó un asiento de tu reserva <b>#${orderId}</b>.</p>
    <p><b>${from} → ${to}</b> (recargo +Q ${money(increment)}).</p>`;
  return layout('Modificación de asiento', body);
}

// 4) Cancelación de asiento
function buildItemCanceledHtml({ orderId, seatCode }) {
  const body = `<p>Se canceló el asiento <b>${seatCode}</b> de tu reserva <b>#${orderId}</b>.</p>`;
  return layout('Cancelación de asiento', body);
}

// 5) Cancelación de reserva completa
function buildOrderCanceledHtml({ orderId }) {
  const body = `<p>Tu reserva <b>#${orderId}</b> fue cancelada.</p>`;
  return layout('Cancelación de reserva', body);
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