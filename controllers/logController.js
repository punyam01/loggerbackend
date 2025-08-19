import ScalpLog from '../models/log.model.js'
import { apiResponse } from '../utils/apiResponse.js'
import { errorResponse } from '../utils/errorResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.utils.js'
export const addLog = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  if (!userId) {
    throw new errorResponse(401, 'User is not authenticated')
  }

  // Parse stringified fields from multipart/form-data
  const symptoms = req.body.symptoms
    ? JSON.parse(req.body.symptoms)
    : {
        itching: 0,
        flaking: 0,
        redness: 0,
        oiliness: 0,
        tightness: 0,
        tenderness: 0,
        hypopigmentation: 0,
        hairThinning: 0,
        dryness: 0
      }
  const symptomTiming = req.body.symptomTiming
    ? JSON.parse(req.body.symptomTiming)
    : {}
  const productsUsed = req.body.productsUsed
    ? JSON.parse(req.body.productsUsed)
    : {
        beaBayouProducts: [],
        otherProducts: ''
      }
  const haircareRoutine = req.body.haircareRoutine
    ? JSON.parse(req.body.haircareRoutine)
    : {
        hairstyle: '',
        wasWashDay: false
      }
  const stressLevel = req.body.stressLevel ? parseInt(req.body.stressLevel) : 0
  const dietLifestyle = req.body.dietLifestyle
    ? JSON.parse(req.body.dietLifestyle)
    : {
        meals: '',
        consumedAlcohol: false,
        highSugarIntake: false
      }
  const personalNotes = req.body.personalNotes || ''

  // Handle single file (field: scalpPhotos)
  let photoUrl = null
  if (req.file?.path) {
    const uploaded = await uploadOnCloudinary(req.file.path)
    photoUrl = uploaded?.secure_url || null
  }

  const newLog = new ScalpLog({
    user: userId,
    symptoms,
    symptomTiming,
    scalpPhotos: photoUrl ? [photoUrl] : [], // store as array with 0/1 URL
    productsUsed,
    haircareRoutine,
    stressLevel,
    dietLifestyle,
    personalNotes
  })

  const savedLog = await newLog.save()
  res
    .status(201)
    .json(new apiResponse(201, savedLog, 'Log entry added successfully'))
})

export const getCurrentMonthLogCount = asyncHandler(async (req, res) => {
  const userId = req.user._id

  if (!userId) {
    throw new errorResponse(400, 'User ID is required')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const logCount = await ScalpLog.countDocuments({
    user: userId,
    createdAt: {
      $gte: startOfMonth,
      $lt: startOfNextMonth
    }
  })

  return res.status(200).json(
    new apiResponse(200, {
      logCount,
      month: startOfMonth.toLocaleString('default', { month: 'long' })
    })
  )
})

export const getLastLogInfo = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.params.userId || req.body.user

  if (!userId) {
    throw new errorResponse(400, 'User ID is required')
  }

  const lastLog = await ScalpLog.findOne({ user: userId }).sort({
    createdAt: -1
  })

  if (!lastLog) {
    throw new errorResponse(404, 'No logs found for this user')
  }

  const lastLogDate = lastLog.createdAt
  const today = new Date()
  const diffInMs = today - lastLogDate
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  res.status(200).json(
    new apiResponse(
      200,
      {
        lastLogDate: lastLogDate.toISOString(),
        daysSinceLastLog: diffInDays,
        lastLogId: lastLog._id
      },
      'Last log date retrieved successfully'
    )
  )
})

export const getSymptomTrend = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.params.userId || req.body.user

  if (!userId) {
    throw new errorResponse(400, 'User ID is required')
  }

  const logs = await ScalpLog.find({ user: userId }).sort({ createdAt: 1 })

  if (!logs || logs.length === 0) {
    throw new errorResponse(404, 'No logs found for this user')
  }

  const today = new Date()

  const trendData = logs.map(log => {
    const createdAt = new Date(log.createdAt)

    const symptoms = log.symptoms || {}
    const symptomValues = Object.values(symptoms)
    const total = symptomValues.reduce((acc, val) => acc + val, 0)
    const average = symptomValues.length > 0 ? total / symptomValues.length : 0

    const diffInMs = today - createdAt
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    return {
      logId: log._id,
      date: createdAt.toISOString(),
      averageSymptomScore: average.toFixed(2),
      daysSinceLog: diffInDays
    }
  })

  res
    .status(200)
    .json(
      new apiResponse(200, trendData, 'Symptom trend retrieved successfully')
    )
})
