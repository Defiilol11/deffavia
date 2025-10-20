const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();


console.log('[SMTP VARS]', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  passLen: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0
});
/**
 * Obtiene un transporter:
 * 1. Si USE_ETHEREAL=true => siempre Ethereal.
 * 2. Si faltan host/user/pass => Ethereal (modo fallback).
 * 3. Si todo está presente => transporter real.
 */
async function getTransport() {
  const forceEthereal = /^true$/i.test(process.env.USE_ETHEREAL || '');
  const haveRealCreds =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (forceEthereal || !haveRealCreds) {
    const testAccount = await nodemailer.createTestAccount(); // crea cuenta temporal
    const transport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    return { transport, ethereal: true, testAccount };
  }

  // Transport real
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465, // 465 = SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return { transport, ethereal: false };
}

// Ping
router.get('/ping', (_req, res) => res.json({ ok: true, service: 'mail' }));

router.post('/send-quote', async (req, res) => {
  try {
    const { toEmail, html, subject } = req.body || {};
    if (!toEmail || !html) {
      return res.status(400).json({ ok: false, error: 'Faltan parámetros (toEmail, html).' });
    }

    const { transport, ethereal, testAccount } = await getTransport();

    const info = await transport.sendMail({
      from: process.env.MAIL_FROM || '"Deffavia" <no-reply@deffavia.local>',
      to: toEmail,
      subject: subject || 'Deffavia — Cotización de reserva',
      html
    });

    if (ethereal) {
      const preview = nodemailer.getTestMessageUrl(info);
      console.log('Ethereal preview URL:', preview);
      return res.json({ ok: true, ethereal: true, previewUrl: preview, account: testAccount.user });
    }
    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error('Mail error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;