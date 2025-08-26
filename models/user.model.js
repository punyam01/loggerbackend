import mongoose from 'mongoose'
const { Schema } = mongoose
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return emailRegex.test(value)
        },
        message: 'Invalid email address format'
      }
    },
    password: {
      type: String,
      required: function () {
        // Only require a password for local sign‑in
        return this.authProvider === 'local'
      },
      minlength: [6, 'minimum 6 character is required ']
    },
    // ADD THIS MISSING FIELD:
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      required: true
    },
    emailReminder: {
      type: Boolean,
      default: true
    },
    lastReminderSent: {
      type: Date,
      default: null
    },
    reminderTime: {
      type: String, // e.g. "20:00"
      default: null
    },
    nextReminder: {
      type: Date, // exact next Date to trigger
      default: null,
      index: true // so your cron lookup is fast
    }
  },
  { timestamps: true }
)

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (this.authProvider === 'google' || !this.isModified('password'))
    return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model('User', userSchema)
