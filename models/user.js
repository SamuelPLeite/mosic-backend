const mongoose = require('mongoose')
const uniVal = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  image: { type: String },
  musicPosts: [{
    type: mongoose.Types.ObjectId,
    ref: 'MusicPost',
    required: true
  }]
})

userSchema.plugin(uniVal)

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('User', userSchema)