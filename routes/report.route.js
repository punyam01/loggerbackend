import express from 'express'
import { emailReport, generateReport } from '../controllers/reportController.js'
import { verifyLogin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Route for generating report for a specific user
router.get('/generate', verifyLogin, generateReport)

router.post('/mailreport', verifyLogin, emailReport)
export default router
