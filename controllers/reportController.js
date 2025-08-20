import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { ReportService } from '../services/reportService.js'
import { errorResponse } from '../utils/errorResponse.js'
import { sendReportEmail } from '../utils/sendEmail.js'

export const generateReport = asyncHandler(async (req, res) => {
  try {
    // 1. User must be logged in (req.user injected by auth middleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found in request'
      })
    }

    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // 2. Generate the DOCX buffer using your report service
    const reportBuffer = await ReportService.generate30DayReport(
      userId,
      user.name
    )

    // 3. If no logs, generate30DayReport MUST return null/undefined/not Buffer
    if (!Buffer.isBuffer(reportBuffer)) {
      return res.status(400).json({
        success: false,
        message:
          'No logs found in the last 30 days. Please add a log before generating the report.'
      })
    }

    // 4. Set Content-Type and Content-Disposition headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="hair-care-report-${user.name}-${
        new Date().toISOString().split('T')[0]
      }.docx"`
    )
    res.setHeader('Content-Length', reportBuffer.length)

    // 5. Send the real binary DOCX
    res.end(reportBuffer)
  } catch (error) {
    console.error('Report generation failed:', error)

    // Don't override the specific "no logs" message with a generic one
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message:
          'An unexpected error occurred while generating the report. Please try again later.'
      })
    }
  }
})

export const emailReport = asyncHandler(async (req, res) => {
  // 1) Ensure authenticated
  const doctorMail = req.body.email
  if (!doctorMail)
    throw new errorResponse(400, 'Email is required to send report')

  if (!req.user || !req.user._id) {
    throw new errorResponse(401, 'Unauthorized: No user found in request')
  }

  const userId = req.user._id
  const user = await User.findById(userId)
  if (!user) {
    throw new errorResponse(404, 'User not found')
  }

  // 2) Generate DOCX Buffer
  const buffer = await ReportService.generate30DayReport(userId, user.name)

  // 3) Handle “no logs” case
  if (!Buffer.isBuffer(buffer)) {
    return res.status(400).json({
      success: false,
      message:
        'No logs found in the last 30 days. Please add a log before generating the report.'
    })
  }

  // 4) Send email with attachment
  await sendReportEmail({
    to: doctorMail, // ensure User model has 'email'
    userName: user.name,
    buffer
  })

  return res.status(200).json({
    success: true,
    message: 'Report emailed successfully.'
  })
})
