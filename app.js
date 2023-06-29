const express = require('express')

const musicRouter = require('./routes/music')
const usersRouter = require('./routes/users')
const HttpError = require('./models/http-error')


const app = express()

app.use(express.json())

app.use('/api/music', musicRouter)
app.use('/api/users', usersRouter)

app.use((req, res, next) => {
  throw new HttpError('Route not found.', 404)
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }

  res.status(error.code || 500)
  res.json({ message: error.message || 'Unknown error.' })
})

app.listen(3001)