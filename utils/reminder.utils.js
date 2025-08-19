export function computeNextReminder (reminderTime) {
  const [hour, minute] = reminderTime.split(':').map(Number)
  const now = new Date()

  const next = new Date(now)
  next.setHours(hour, minute, 0, 0)

  // if today’s time is already past, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1)
  }
  return next
}
