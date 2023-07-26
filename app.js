const fs = require('fs')
const path = require('path')

const express = require('express')
const { config } = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')

const musicRouter = require('./routes/music')
const usersRouter = require('./routes/users')
const deezerRouter = require('./routes/deezer')
const { tokenExtractor } = require('./middleware/extractors')
const HttpError = require('./models/http-error')

const app = express()

config()

app.use(cors())
app.use(express.json())

app.use(tokenExtractor)
app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use('/api/music', musicRouter)
app.use('/api/users', usersRouter)
app.use('/api/deezer', deezerRouter)

app.use((req, res, next) => {
  throw new HttpError('Route not found.', 404)
})

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => console.log(error))
  }
  if (res.headerSent) {
    return next(error)
  }

  res.status(error.code || 500)
  res.json({ message: error.message || 'Unknown error.' })
})

console.log(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mosiccluster.mexbla0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mosiccluster.mexbla0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(3001)
  }).catch(error => console.log(error))
