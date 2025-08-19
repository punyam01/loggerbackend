import jwt from 'jsonwebtoken'
import { errorResponse } from '../utils/errorResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'

export const verifyLogin = asyncHandler(async (req, _res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new errorResponse(401, 'Unauthorized request')
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select('-password')

    if (!user) {
      throw new errorResponse(401, 'Invalid Access Token')
    }

    req.user = user // ✅ Set req.user here
    next()
  } catch (error) {
    throw new errorResponse(401, error?.message || 'Invalid Access Token')
  }
})
