import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import sendToken from './../utils/jwtToken.js'

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

export { registerUser, loginUser }
