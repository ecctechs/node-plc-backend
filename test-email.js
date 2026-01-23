'use strict';
require('dotenv').config(); // โหลดค่าจาก .env
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("--- Starting Email Test ---");

  // คอนฟิกตามที่คุณให้มา
  const transporter = nodemailer.createTransport({
    host: 'mail.eccsolutions.co.th',
    port: 587,
    secure: false, // ใช้ false สำหรับ STARTTLS (Port 587)
    auth: {
      user: 'techs@eccsolutions.co.th',
      pass: 'T4ch@ECC!solutions',
    },
    tls: {
      rejectUnauthorized: false // ข้ามการเช็คใบรับรอง SSL ชั่วคราว
    }
  });
  

  try {
    const info = await transporter.sendMail({
      from: '"PLC Test System" <techs@eccsolutions.co.th>',
      to: 'eccerp2568@gmail.com', // 👈 ใส่เมลของคุณตรงนี้เพื่อรับเมลทดสอบ
      subject: 'Test Alarm System ✔',
      text: 'Hello, this is a test email from your PLC Alarm system.',
      html: `
        <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #007bff;">PLC System Connection Test</h2>
          <p>หากคุณได้รับเมลนี้ แสดงว่า <strong>Nodemailer</strong> และ <strong>SMTP Server</strong> ทำงานได้ถูกต้อง</p>
          <hr>
          <p><strong>Server:</strong> mail.eccsolutions.co.th</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(error);
  }
}

testEmail();