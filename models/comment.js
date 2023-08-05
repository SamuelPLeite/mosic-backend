const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
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

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Comment', commentSchema)