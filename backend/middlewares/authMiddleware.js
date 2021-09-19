import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

const isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id)

  next()
})

// Handling users roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Error('Not authorized as an admin'))
    }
    next()
  }
}

export { isAuthenticatedUser, authorizeRoles }
