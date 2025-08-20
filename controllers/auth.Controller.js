import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'
import { errorResponse } from '../utils/errorResponse.js'
import { cookieOptions } from '../utils/cookie.utils.js'
import { apiResponse } from '../utils/apiResponse.js'
// Login with email and password
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new errorResponse(400, 'Email and password are required')
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new errorResponse(404, 'User not found')
  }

  //  if (user.authProvider !== 'local') {
  //    throw new errorResponse(400, `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`);
  //   }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new errorResponse(401, 'Invalid credentials')
  }

  const accessToken = user.generateAccessToken()

  const loggedInUser = await User.findById(user._id).select('-password')

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, accessToken },
        'login successful'
      )
    )
})
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Only email and password are required; name is optional.
  if (!email || !password) {
    throw new errorResponse(400, 'Email and password are required')
  }

  // Check if a user with this email already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new errorResponse(
      400,
      'User with this email already exists. Please login.'
    )
  }

  // If name is not provided, default to using the email (or leave it as an empty string)
  const userName = name ? name : email

  // Create a new user. The password will be hashed via the pre-save hook in your model.
  const newUser = await User.create({
    name: userName,
    email,
    password,
    authProvider: 'local'
  })

  // Generate an access token using your model's method
  const accessToken = newUser.generateAccessToken()

  // Retrieve the new user data without sensitive fields (like password)
  const userResponse = await User.findById(newUser._id).select('-password')

  return res
    .status(201)
    .cookie('accessToken', accessToken, cookieOptions)
    .json(
      new apiResponse(
        201,
        { user: userResponse, token: accessToken },
        'User registered successfully'
      )
    )
})

// Handle Google OAuth callback
export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user

  // Generate token
  const accessToken = user.generateAccessToken()

  // Get user data without sensitive fields
  const userData = await User.findById(user._id).select('-password')

  // Determine where to redirect after successful login
  const redirectUrl = process.env.FRONTEND_URL || '/'

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .redirect(`${redirectUrl}?login=success`)
})

// Get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user

  return res
    .status(200)
    .json(new apiResponse(200, user, 'User details fetched successfully'))
})

// Logout
export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .json(new apiResponse(200, {}, 'Logged out successfully'))
})
