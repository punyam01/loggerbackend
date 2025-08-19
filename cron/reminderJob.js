// jobs/reminder.job.js
import cron from 'node-cron'
import { User } from '../models/user.model.js'
import Log from '../models/log.model.js' // adjust if your log model file name differs
import { sendReminderEmail } from '../utils/sendEmail.js' // your nodemailer helper
import { computeNextReminder } from '../utils/reminder.utils.js' // your function

// Runs at minute 0 of every hour (e.g., 09:00, 10:00, …)
cron.schedule('0 * * * *', async () => {
  const now = new Date()

  try {
    // Only users who opted in, have a time set, and whose nextReminder has arrived/passed
    const users = await User.find({
      emailReminder: true,
      reminderTime: { $exists: true, $ne: null },
      nextReminder: { $lte: now }
    })
      .select('_id name email reminderTime nextReminder')
      .lean()

    if (!users.length) return

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    for (const u of users) {
      // Has user created a log today?
      const hasLogToday = await Log.exists({
        user: u._id,
        createdAt: { $gte: startOfToday }
      })

      // If no log today, send the reminder email
      if (!hasLogToday) {
        await sendReminderEmail({
          to: u.email,
          subject: 'Daily Reminder',
          text: `Hi ${
            u.name || 'there'
          }, you haven’t created a log today. Please add it now.`,
          html: `<p>Hi ${
            u.name || 'there'
          },</p><p>You haven’t created a log today. Please add it now.</p>`
        })
      }

      // IMPORTANT: bump nextReminder to the NEXT valid time (usually tomorrow at reminderTime)
      const newNext = computeNextReminder(u.reminderTime)

      // Persist the new nextReminder
      await User.updateOne({ _id: u._id }, { $set: { nextReminder: newNext } })
    }
  } catch (err) {
    console.error('Reminder job error:', err)
  }
})
