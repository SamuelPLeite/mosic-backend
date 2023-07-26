const mongoose = require('mongoose')

const respinPostSchema = new mongoose.Schema({
  musicPost: {
    type: mongoose.Types.ObjectId,
    ref: 'MusicPost',
    required: true
  },
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

respinPostSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.respinId = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v

    if (returnedObject.musicPost.title) {
      for (const [key, value] of Object.entries(returnedObject.musicPost)) {
        returnedObject[key] = value
      }
      delete returnedObject.musicPost
    }

  }
})

module.exports = mongoose.model('RespinPost', respinPostSchema)