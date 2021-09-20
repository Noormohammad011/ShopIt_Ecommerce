import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import sendToken from './../utils/jwtToken.js'
import sendEmail from './../utils/sendEmail.js'
import crypto from 'crypto'
// Register a user   => /api/v1/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: 'OIP.h4OZoGPXvqeHbMOJ0Xmr5gHaHa',
      url: 'https://th.bing.com/th/id/OIP.h4OZoGPXvqeHbMOJ0Xmr5gHaHa?w=192&h=192&c=7&r=0&o=5&dpr=1.25&pid=1.7',
    },
  })

  if (user) {
    sendToken(user, 200, res)
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// Login User  =>  /a[i/v1/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')

  if (user && (await user.matchPassword(password))) {
    sendToken(user, 200, res)
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// Logout user   =>   /api/v1/logout
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    message: 'Logged out',
  })
})

// Forgot Password   =>  /api/v1/password/forgot
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new Error('User not found with this email', 404))
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  // Create reset password url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/password/reset/${resetToken}`

  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

  try {
    await sendEmail({
      email: user.email,
      subject: 'ShopIT Password Recovery',
      message,
    })

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new Error(error.message, 500))
  }
})

// Reset Password   =>  /api/v1/password/reset/:token
const resetPassword = asyncHandler(async (req, res, next) => {
  // Hash URL token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(
      new Error('Password reset token is invalid or has been expired', 400)
    )
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new Error('Password does not match', 400))
  }

  // Setup new password
  user.password = req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, 200, res)
})

export { registerUser, loginUser, logout, forgotPassword, resetPassword }
