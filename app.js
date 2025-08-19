import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorResponse } from './utils/errorResponse.js'
import cookieParser from 'cookie-parser'
const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  })
)
// Middleware
app.use(helmet())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

import reportRoutes from './routes/report.route.js'
import logRoutes from './routes/log.route.js'
import userRoutes from './routes/user.route.js'
import authRoutes from './routes/auth.route.js'
// Routes
app.use('/api/v1/reports', reportRoutes)
app.use('/api/v1/log', logRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/auth', authRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof errorResponse) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    })
  }

  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

export default app
