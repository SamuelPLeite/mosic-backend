const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const HttpError = require('../models/http-error')
const User = require('../models/user')


const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't get users.", 500))
  }

  res.json({ users })

}

const login = async (req, res, next) => {
  const { email, password } = req.body

  let existUser
  try {
    existUser = await User.findOne({ email })
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't resolve email query.", 500))
  }

  if (!existUser) {
    return next(new HttpError('User not found by email.', 403))
  }

  let isValPass = false
  try {
    isValPass = await bcrypt.compare(password, existUser.password)
  } catch (err) {
    return next(new HttpError('Could not log user in, try again.', 500))
  }

  if (!isValPass)
    return next(new HttpError('Invalid credentials.', 403))

  let token
  try {
    token = jwt.sign(
      { userId: existUser.id, email: existUser.email },
      'secret-key-kaka',
      { expiresIn: '1h' }
    )
  } catch (err) {
    return next(new HttpError("Log in error, do try again.", 500))
  }

  res.json({
    userId: existUser.id,
    username: existUser.name,
    token
  })
}

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError("Invalid input detected.", 422))
  }

  const { name, email, password } = req.body

  let existUser
  try {
    existUser = await User.findOne({ email })
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't resolve email query.", 500))
  }

  if (existUser)
    return next(new HttpError("User already exists with provided email.", 422))

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    return next(new HttpError("Error, user couldn't be created", 500))
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    musicPosts: [],
    respinPosts: []
  })

  try {
    await newUser.save()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't create user.", 500))
  }

  let token
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      'secret-key-kaka',
      { expiresIn: '1h' }
    )
  } catch (err) {
    return next(new HttpError("Sign up error, do try again.", 500))
  }

  res.status(201).json({ token, userId: newUser.id, username: newUser.name })
}

exports.getUsers = getUsers
exports.login = login
exports.signup = signup
