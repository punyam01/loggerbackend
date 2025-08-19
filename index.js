import dotenv from 'dotenv'
dotenv.config()
import app from './app.js'
import { dbConnect } from './config/db.js'
import './cron/reminderJob.js' // Import the cron job to start it

const PORT = process.env.PORT || 5000

dbConnect()
  .then(() => {
    app.on('error', error => {
      console.log('ERROR: ', error)
      throw error
    })

    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`)
    })
  })
  .catch(err => {
    console.log('MongoDB connection failed', err)
  })
