import express from 'express'
import { verifyLogin } from '../middleware/auth.middleware.js'
import passport from 'passport'
import {
  login,
  googleCallback,
  getCurrentUser,
  logout,
  register
} from '../controllers/auth.Controller.js'

const router = express.Router()

router.route('/login').post(login)

router.route('/register').post(register)

router.route('/me').get(verifyLogin, getCurrentUser)

router.route('/logout').post(verifyLogin, logout)

// Google OAuth Routes
router
  .route('/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }))

router.route('/google/callback').get(
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  googleCallback
)

export default router
