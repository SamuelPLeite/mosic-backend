const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const MusicPost = require('../models/musicpost')
const RespinPost = require('../models/respin')
const User = require('../models/user')

const getPostById = async (req, res, next) => {
  const mid = req.params.mid

  let music
  try {
    music = await MusicPost.findById(mid).populate({
      path: 'comments',
      populate: {
        path: 'creatorId',
        select: '_id name image'
      }
    })
    console.log(music.comments)
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
    userMusic = await MusicPost.find({ creatorId: uid }).lean().populate({
      path: 'comments', populate: {
        path: 'creatorId',
        select: '_id name image'
      }
    })
  } catch (err) {
    next(new HttpError("Database error, couldn't find posts.", 500))
    console.log(err)
    return
  }

  let user, userRespins
  try {
    user = await User.findById(uid).lean().populate({
      path: 'respinPosts',
      populate: {
        path: 'musicPost',
        populate: {
          path: 'comments',
          populate: {
            path: 'creatorId',
            select: '_id name image'
          }
        }
      }
    })
    userRespins = user.respinPosts.filter(respin => respin.musicPost !== null)
  } catch (err) {
    next(new HttpError("Database error, couldn't find posts.", 500))
    console.log(err)
    return
  }

  if (userMusic.length === 0 && userRespins.length === 0)
    return next(new HttpError('No music posts found for the User ID.', 404))

  const userPosts = userRespins ? userMusic.concat(userRespins) : userMusic
  const userPostsSorted = userPosts.sort((a, b) => new Date(b._id.getTimestamp().getTime()) - new Date(a._id.getTimestamp().getTime())) // sorting based on id timestamp
  const userPostsPop = userPostsSorted.map(post => post.musicPost ? { ...post.musicPost, respinId: post._id } : post) // populates respin posts into 'regular' posts
    .map(({ __v, _id, ...rest }) => ({ id: _id.toString(), ...rest })) // because of lean(), manually removing __v, id to string
  console.log(userPostsPop)

  res.json({ userMusic: userPostsPop })
}

const getPostsByUserId2 = async (req, res, next) => {
  const uid = req.params.uid

  let user, userRespins, userMusic
  try {
    user = await User.findById(uid)
      .populate({
        path: 'respinPosts',
        populate: {
          path: 'musicPost',
          populate: [{
            path: 'comments',
            populate: {
              path: 'creatorId',
              select: '_id name image'
            }
          },
          {
            path: 'creatorId',
            select: '_id name image'
          }]
        }
      })
      .populate({
        path: 'musicPosts',
        populate: [{
          path: 'comments',
          populate: {
            path: 'creatorId',
            select: '_id name image'
          }
        },
        {
          path: 'creatorId',
          select: '_id name image'
        }]
      })

    userRespins = user.respinPosts.filter(respin => respin.musicPost !== null)
    userMusic = user.musicPosts
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't find posts.", 500))
  }

  if (userMusic.length === 0 && userRespins.length === 0)
    return next(new HttpError('No music posts found for the User ID.', 404))

  const userPosts = userRespins ? userMusic.concat(userRespins) : userMusic
  const userPostsSorted = userPosts.sort((a, b) => new Date(b._id.getTimestamp().getTime()) - new Date(a._id.getTimestamp().getTime())) // sorting based on id timestamp

  res.json({ userMusic: userPostsSorted })
}

const getPostsSearch = async (req, res, next) => {
  const query = req.query

  const infoQuery = {}
  for (const [key, value] of Object.entries(query)) {
    infoQuery[`info.${key}`] = value
  }

  let music
  try {
    music = await MusicPost.find(infoQuery).populate({
      path: 'comments',
      populate: {
        path: 'creatorId',
        select: '_id name image'
      }
    }).populate({
      path: 'creatorId',
      select: '_id name image'
    })
  } catch (err) {
    next(new HttpError("Database error, couldn't find post.", 500))
    console.log(err)
    return
  }

  if (!music)
    return next(new HttpError('Invalid Music ID, no post found.', 404))

  const musicAux = [...music]
  musicAux.reverse()

  res.json({ music: musicAux })
}

const getRespinPosts = async (req, res, next) => {
  const respinPosts = req.user.respinPosts.map(post => post.musicPost)
  res.json({ respinPosts })
}

const createMusicPost = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input detected.', 422))
  }

  const { title, artist, description, image, rating, isSong, info } = req.body
  const newMusicPost = new MusicPost({
    title,
    artist,
    description,
    image,
    rating,
    isSong,
    info,
    comments: [],
    likes: [],
    creatorId: req.user.id
  })

  const user = req.user

  try {
    const session = await mongoose.startSession()
    session.startTransaction()

    await newMusicPost.save({ session })
    user.musicPosts.push(newMusicPost)
    await user.save({ session })

    await session.commitTransaction()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't save new post.", 500))
  }

  res.status(201).json({ music: newMusicPost })
}

const updateMusicPost = async (req, res, next) => {
  const mid = req.params.mid
  const { description, rating } = req.body

  let music
  try {
    music = await MusicPost.findOneAndUpdate(
      {
        _id: mid,
        creatorId: req.user.id
      },
      { description, rating },
      { returnDocument: 'after' })
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

  if (music.creatorId.id !== req.user.id)
    return next(new HttpError('You are not allowed to delete this post!', 401))

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

const createRespinPost = async (req, res, next) => {
  const { musicPost } = req.body
  const user = req.user

  let existRespin
  try {
    existRespin = await RespinPost.findOne({ musicPost, creatorId: user.id })
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't resolve respin query.", 500))
  }

  if (existRespin)
    return next(new HttpError("User already has respun music post.", 422))


  const newRespinPost = new RespinPost({
    musicPost,
    creatorId: user.id
  })

  try {
    const session = await mongoose.startSession()
    session.startTransaction()

    await newRespinPost.save({ session })
    user.respinPosts.push(newRespinPost)
    await user.save({ session })

    await session.commitTransaction()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't respin post.", 500))
  }

  res.status(201).json({ music: newRespinPost })
}

const deleteRespinPost = async (req, res, next) => {
  const mid = req.params.mid

  let respin
  try {
    respin = await RespinPost.findOne({ musicPost: mid, creatorId: req.user.id }).populate('creatorId')
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't delete respin.", 500))
  }

  if (!respin)
    return next(new HttpError('No respin post found for provided ID.', 404))

  if (respin.creatorId.id !== req.user.id)
    return next(new HttpError('You are not allowed to delete this post!', 401))

  try {
    const session = await mongoose.startSession()
    session.startTransaction()

    await RespinPost.findByIdAndDelete(respin._id, { session })
    respin.creatorId.respinPosts.pull(respin)
    await respin.creatorId.save({ session })

    await session.commitTransaction()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't delete post.", 500))
  }
  res.status(200).json({ message: 'Deleted respin post.' })
}

exports.getPostById = getPostById
exports.getPostsByUserId = getPostsByUserId
exports.getPostsByUserId2 = getPostsByUserId2
exports.createMusicPost = createMusicPost
exports.updateMusicPost = updateMusicPost
exports.deleteMusicPost = deleteMusicPost
exports.createRespinPost = createRespinPost
exports.deleteRespinPost = deleteRespinPost
exports.getRespinPosts = getRespinPosts
exports.getPostsSearch = getPostsSearch