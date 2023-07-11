const jwt = require('jsonwebtoken')

const User = require('../models/user')
const HttpError = require('../models/http-error')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('Authorization')
  if (authorization && authorization.startsWith('bearer ')) {
    request.token = authorization.replace('bearer ', '')
  } else
    request.token = null

  next()
}

const userExtractor = async (request, response, next) => {
  let decodedToken
  try {
    decodedToken = jwt.verify(request.token, 'secret-key-kaka')
  } catch (err) {
    return next(new HttpError('Invalid token.', 403))
  }
  request.user = await User.findById(decodedToken.userId)

  next()
}

module.exports = {
  tokenExtractor,
  userExtractor
}