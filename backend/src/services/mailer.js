const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  connectionTimeout: 8000,
  socketTimeout: 8000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPinEmail(to, fullName, pin) {
  await transporter.sendMail({
    from: `Campus Lago <${process.env.SMTP_USER}>`,
    to,
    subject: 'Campus Lago — PIN de recuperación de contraseña',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:2rem">
        <h2 style="color:#2563eb;margin-bottom:.5rem">Campus Lago</h2>
        <p>Hola ${fullName || 'usuario'},</p>
        <p>Tu PIN de recuperación de contraseña es:</p>
        <div style="font-size:2.5rem;font-weight:700;letter-spacing:.3em;color:#1e293b;
                    background:#f1f5f9;border-radius:12px;padding:1.2rem 2rem;
                    text-align:center;margin:1.5rem 0">${pin}</div>
        <p style="color:#4a5568;font-size:.9rem">
          Este PIN es válido durante <strong>15 minutos</strong>.<br>
          Si no lo pediste tú, ignora este mensaje.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0">
        <p style="color:#94a3b8;font-size:.8rem">IES El Lago · Campus Lago</p>
      </div>`,
  });
}

module.exports = { sendPinEmail };
