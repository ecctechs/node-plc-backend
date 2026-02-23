'use strict';
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.eccsolutions.co.th',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // port 587 uses STARTTLS
  auth: {
    user: process.env.EMAIL_USER || 'techs@eccsolutions.co.th',
    pass: process.env.EMAIL_PASS || 'T4ch@ECC!solutions',
  },
  tls: { rejectUnauthorized: false }
});

// Send alarm email to recipients
async function sendAlarmEmail(recipients, subject, htmlContent) {
  try {
    if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
      console.error('[EMAIL ERROR] No recipients specified');
      return false;
    }

    const info = await transporter.sendMail({
      from: '"PLC Alarm System" <techs@eccsolutions.co.th>',
      to: Array.isArray(recipients) ? recipients.join(', ') : recipients,
      subject,
      html: htmlContent,
    });

    console.log('[EMAIL SENT] Message ID: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return false;
  }
}

module.exports = { sendAlarmEmail };
