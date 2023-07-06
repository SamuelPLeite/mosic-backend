const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const User = require('../models/user')


const USERS = [
  {
    id: 'uid1',
    name: 'Sam Leite',
    email: 'ana@mary.b',
    password: 'PAXXWORD'
  }
]

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

  if (!existUser || existUser.password !== password) {
    return next(new HttpError('User not found by email or wrong password.', 401))
  }

  res.json({ user: existUser })
}

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input detected.', 422))
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
    return next(new HttpError('User already exists with provided email.', 422))

  const newUser = new User({
    name,
    email,
    password,
    image: req.file.path,
    musicPosts: []
  })

  try {
    await newUser.save()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't create user.", 500))
  }

  res.status(201).json({ user: newUser })
}

exports.getUsers = getUsers
exports.login = login
exports.signup = signup
