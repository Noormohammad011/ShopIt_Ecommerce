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
      new Error('Password reset token is invalid or has been expired')
    )
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new Error('Password does not match'))
  }

  // Setup new password
  user.password = req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, 200, res)
})
// Get currently logged in user details   =>   /api/v1/me
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success: true,
    user,
  })
})

// Update / Change password   =>  /api/v1/password/update
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  // Check previous user password
  const isMatched = await user.matchPassword(req.body.oldPassword)
  if (!isMatched) {
    res.status(400)
    throw new Error('Old password is incorrect')
  }

  user.password = req.body.password
  await user.save()

  sendToken(user, 200, res)
})

// Update user profile   =>   /api/v1/me/update
const updateProfile = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }

  // Update avatar
  // if (req.body.avatar !== '') {
  //   const user = await User.findById(req.user.id)

  //   const image_id = user.avatar.public_id
  //   const res = await cloudinary.v2.uploader.destroy(image_id)

  //   const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: 'avatars',
  //     width: 150,
  //     crop: 'scale',
  //   })

  //   newUserData.avatar = {
  //     public_id: result.public_id,
  //     url: result.secure_url,
  //   }
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
  })
})

// Get all users   =>   /api/v1/admin/users
const allUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    success: true,
    users,
  })
})

// Get user details   =>   /api/v1/admin/user/:id
const getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json({ success: true, user })
  } else {
    res.status(404)
    throw new Error(`User does not found with id: ${req.params.id}`)
  }
})

// Update user profile   =>   /api/v1/admin/user/:id
const updateUser = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
  })
})

// Delete user   =>   /api/v1/admin/user/:id
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new Error(`User does not found with id: ${req.params.id}`))
  }

  // Remove avatar from cloudinary
  // const image_id = user.avatar.public_id
  // await cloudinary.v2.uploader.destroy(image_id)

  await user.remove()

  res.status(200).json({
    success: true,
  })
})

export {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
}
