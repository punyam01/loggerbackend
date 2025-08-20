import express from 'express'
import { checkEmail, setReminder } from '../controllers/user.Controller.js'

import { verifyLogin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Route to check if an email exists
router.route('/check-email').post(checkEmail)

// Route to register a new user

router.route('/setreminder').put(verifyLogin, setReminder)
export default router
