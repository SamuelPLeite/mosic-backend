const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')


const HttpError = require('../models/http-error')


const USERS = [
  {
    id: 'uid1',
    name: 'Sam Leite',
    email: 'ana@mary.b',
    password: 'PAXXWORD'
  }
]

const getUsers = (req, res, next) => {

  res.json({ users: USERS })
}

const login = (req, res, next) => {
  const { email, password } = req.body

  const emailUser = USERS.find(user => user.email === email)

  if (!emailUser || emailUser.password !== password) {
    return next(new HttpError('User not found by email or wrong password.', 401))
  }

  res.json({ message: 'Logged in!' })
}

const signup = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input detected.', 422))
  }

  const { name, email, password } = req.body

  if (USERS.find(user => user.email === email))
    return next(new HttpError('Email already has user associated with it.', 422))

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password
  }

  USERS.push(newUser)

  res.status(201).json({ user: newUser })
}

exports.getUsers = getUsers
exports.login = login
exports.signup = signup
