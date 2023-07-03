const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const MusicPost = require('../models/musicpost')
const User = require('../models/user')

const MUSIC = [
  {
    id: "mid1",
    title: "Notget",
    artist: "Björk",
    image: "https://upload.wikimedia.org/wikipedia/pt/f/f1/Bj%C3%B6rk_-_Vulnicura_%28Official_Album_Cover%29.png",
    description: "What a song! :D",
    rating: "5/5",
    isSong: true,
    creatorId: "uid1"
  },
  {
    id: "mid2",
    title: "Lionsong",
    artist: "Björk",
    image: "https://upload.wikimedia.org/wikipedia/pt/f/f1/Bj%C3%B6rk_-_Vulnicura_%28Official_Album_Cover%29.png",
    description: "What a song! :D",
    rating: "5/5",
    isSong: true,
    creatorId: "uid2"
  }
]

const getPostById = async (req, res, next) => {
  const mid = req.params.mid

  let music
  try {
    music = await MusicPost.findById(mid)
  } catch (err) {
    next(new HttpError("Database error, couldn't find post.", 500))
    console.log(err)
    return
  }

  if (!music)
    return next(new HttpError('Invalid Music ID, no post found.', 404))

  res.json({ music })
}

const getPostsByUserId = async (req, res, next) => {
  const uid = req.params.uid

  let userMusic
  try {
    userMusic = await MusicPost.find({ creatorId: uid })
  } catch (err) {
    next(new HttpError("Database error, couldn't find posts.", 500))
    console.log(err)
    return
  }

  if (userMusic.length === 0)
    return next(new HttpError('No music posts found for the User ID.', 404))

  res.json({ userMusic })
}

const createMusicPost = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input detected.', 422))
  }

  const { title, artist, description, rating, isSong, creatorId } = req.body
  const newMusicPost = new MusicPost({
    title,
    artist,
    description,
    rating,
    isSong,
    creatorId
  })

  let user
  try {
    user = await User.findById(creatorId)
  } catch (err) {
    next(new HttpError("Database error, couldn't resolve user search.", 500))
    console.log(err)
    return
  }

  if (!user)
    return next(new HttpError("Creator user for new post could not be found.", 404))

  try {
    const session = await mongoose.startSession()
    session.startTransaction()

    await newMusicPost.save({ session })
    user.musicPosts.push(newMusicPost)
    await user.save({ session })

    await session.commitTransaction()
  } catch (err) {
    next(new HttpError("Database error, couldn't save new post.", 500))
    console.log(err)
    return
  }

  res.status(201).json({ music: newMusicPost })
}

const updateMusicPost = async (req, res, next) => {
  const mid = req.params.mid
  const { description, rating } = req.body

  let music
  try {
    music = await MusicPost.findByIdAndUpdate(mid, { description, rating }, { returnDocument: 'after' })
  } catch (err) {
    next(new HttpError("Database error, couldn't update post.", 500))
    console.log(err)
    return
  }

  res.status(200).json({ music })
}

const deleteMusicPost = async (req, res, next) => {
  const mid = req.params.mid

  let music
  try {
    music = await MusicPost.findById(mid).populate('creatorId')
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't delete post.", 500))
  }

  if (!music)
    return next(new HttpError('No music post found for provided ID.', 404))

  try {
    const session = await mongoose.startSession()
    session.startTransaction()

    await MusicPost.findByIdAndDelete(mid, { session })
    music.creatorId.musicPosts.pull(music)
    await music.creatorId.save({ session })

    await session.commitTransaction()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't delete post.", 500))
  }
  res.status(200).json({ message: 'Deleted music post.' })
}

exports.getPostById = getPostById
exports.getPostsByUserId = getPostsByUserId
exports.createMusicPost = createMusicPost
exports.updateMusicPost = updateMusicPost
exports.deleteMusicPost = deleteMusicPost