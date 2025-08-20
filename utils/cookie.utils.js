const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // must be true on HTTPS
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // cross-site cookies in prod
}

export { cookieOptions }
