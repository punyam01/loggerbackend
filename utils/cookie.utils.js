const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' // Only use secure in production
}

export { cookieOptions }
