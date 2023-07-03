const mongoose = require('mongoose')

const musicPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  rating: { type: Number },
  isSong: { type: Boolean, required: true },
  creatorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

musicPostSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('MusicPost', musicPostSchema)