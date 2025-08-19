import express from 'express'
import { upload } from '../middleware/multer.middleware.js'
import { verifyLogin } from '../middleware/auth.middleware.js'
import {
  addLog,
  getCurrentMonthLogCount,
  getLastLogInfo,
  getSymptomTrend
} from '../controllers/logController.js'

const router = express.Router()

// Add a new log entry
router.route('/add').post(verifyLogin, upload.single('scalpPhotos'), addLog)

router.route('/monthlycount').get(verifyLogin, getCurrentMonthLogCount)
router.route('/symptomtrend').get(verifyLogin, getSymptomTrend)
router.route('/lastloginfo').get(verifyLogin, getLastLogInfo)

export default router
