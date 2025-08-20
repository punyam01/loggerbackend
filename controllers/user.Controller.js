import { User } from '../models/user.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiResponse } from '../utils/apiResponse.js'
import { errorResponse } from '../utils/errorResponse.js'

import { computeNextReminder } from '../utils/reminder.utils.js'
export const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new errorResponse(400, 'Email is required')
  }

  const user = await User.findOne({ email })

  if (user) {
    // If an account exists, instruct the client to ask for the password.
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { accountExists: true },
          'Account exists. Please proceed to login with your password.'
        )
      )
  } else {
    // If no account exists, instruct the client to redirect to the signup page.
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { accountExists: false, redirectUrl: '/signup' },
          'No account found. Please sign up.'
        )
      )
  }
})

export const setReminder = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { reminderTime, emailReminder } = req.body
  if (!userId) {
    throw new errorResponse(401, 'userid  is missing')
  }

  if (!reminderTime || !/^\d\d:\d\d$/.test(reminderTime)) {
    throw new errorResponse(400, 'reminderTime is required in "HH:mm" format')
  }

  // Compute the very next reminder Date
  const nextReminder = computeNextReminder(reminderTime)

  // Update the user
  const user = await User.findByIdAndUpdate(
    userId,
    { reminderTime, nextReminder, emailReminder },
    { new: true, runValidators: true }
  ).select('-password')

  res.status(200).json({
    success: true,
    data: {
      reminderTime: user.reminderTime,
      nextReminder: user.nextReminder.toISOString(),
      emailReminder: user.emailReminder
    },
    message: 'Reminder time set successfully'
  })
})
