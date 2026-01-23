'use strict';
const nodemailer = require('nodemailer');

// สร้าง transporter โดยใช้ค่าจาก config/env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.eccsolutions.co.th',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // ใช้ false สำหรับ port 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER || 'techs@eccsolutions.co.th',
    pass: process.env.EMAIL_PASS || 'T4ch@ECC!solutions',
  },
  tls: {
    rejectUnauthorized: false // ช่วยแก้ปัญหาใบรับรอง SSL ในบางเคส
  }
});

/**
 * ฟังก์ชันสำหรับส่งอีเมล
 */
async function sendAlarmEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
        from: 'TTPLC Alarm" <techs@eccsolutions.co.th>', // ใช้ค่าที่ส่งได้แน่นอนไปก่อน
        to: 'eccerp2568@gmail.com',
        subject: subject,
        html: html,
    });

    console.log('[EMAIL SENT] Message ID: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return false;
  }
}

module.exports = { sendAlarmEmail };