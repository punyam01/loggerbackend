// utils/mailer.js
import nodemailer from 'nodemailer'
import { errorResponse } from './errorResponse.js'

function getTransporter () {
  // Create transporter when called (avoids early undefined envs)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // full Gmail address
      pass: process.env.EMAIL_PASS // 16-char Gmail App Password
    }
  })
}

// Reusable generic sender
export async function sendEmail ({ to, subject, text, html, attachments }) {
  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: `"HairCareLog" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments // [{ filename, path|content, contentType }]
    })
    return info
  } catch (err) {
    console.log('', err.message)
    // Optional detailed logs during development:
    // console.error('Email error', { code: err.code, responseCode: err.responseCode, response: err.response, stack: err.stack })
    throw new errorResponse(500, 'Failed to send email: ' + err.message)
  }
}

export async function sendReminderEmail ({ to, subject, text, html }) {
  return sendEmail({ to, subject, text, html })
}

// Specialized helper for the report flow
export async function sendReportEmail ({ to, userName, buffer }) {
  const subject = `Your HairCareLog Report — ${userName}`
  const text = `Hi ${userName},\n\nYour 30-day report is attached.\n\n— HairCareLog`
  const html = `<p>Hi ${userName},</p><p>Your 30-day report is attached.</p><p>— HairCareLog</p>`
  const filename = `hair-care-report-${userName}-${
    new Date().toISOString().split('T')[0]
  }.docx`

  return sendEmail({
    to,
    subject,
    text,
    html,
    attachments: [
      {
        filename,
        content: buffer, // Buffer from ReportService
        contentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    ]
  })
}
