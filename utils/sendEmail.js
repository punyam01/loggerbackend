// utils/sendEmail.js
import nodemailer from 'nodemailer'
import { errorResponse } from './errorResponse.js'

export const sendReminderEmail = async ({ to, subject, text, html }) => {
  try {
    // Optional sanity logs if still debugging
    // console.log('EMAIL_USER?', !!process.env.EMAIL_USER, 'EMAIL_PASS?', !!process.env.EMAIL_PASS)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // full Gmail address
        pass: process.env.EMAIL_PASS // 16-char Gmail App Password
      }
    })

    await transporter.sendMail({
      from: `"Reminder Service" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    })

    console.log(`✅ Email sent to ${to}`)
  } catch (err) {
    throw new errorResponse('Email sending failed')
  }
}
