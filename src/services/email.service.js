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
async function sendAlarmEmail(recipients, subject, htmlContent) {
  try {
    // ตรวจสอบว่ามีผู้รับไหม
    if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
      console.error('[EMAIL ERROR] No recipients specified');
      return false;
    }

    const info = await transporter.sendMail({
      // แก้ไขเครื่องหมายคำพูดให้ถูกต้อง
      from: '"PLC Alarm System" <techs@eccsolutions.co.th>', 
      // แปลง Array เป็น String (comma separated) ถ้าจำเป็น
      to: Array.isArray(recipients) ? recipients.join(', ') : recipients, 
      subject: subject,
      html: htmlContent, // ใช้ตัวแปรที่รับมาจาก Parameters
    });

    console.log('[EMAIL SENT] Message ID: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return false;
  }
}

module.exports = { sendAlarmEmail };