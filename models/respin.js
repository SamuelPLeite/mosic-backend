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
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('RespinPost', respinPostSchema)