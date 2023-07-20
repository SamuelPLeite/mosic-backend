const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const MusicPost = require('../models/musicpost')
const Comment = require('../models/comment')

const createComment = async (req, res, next) => {
  const { content, musicPost } = req.body
  const user = req.user

  let music
  try {
    music = await MusicPost.findById(musicPost).populate('comments')
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't post comment.", 500))
  }

  if (!music)
    return next(new HttpError('No music post found for provided ID.', 404))


  const newComment = new Comment({
    content,
    musicPost,
    creatorId: user.id
  })

  try {
    const session = await mongoose.startSession()
    session.startTransaction()

    await newComment.save({ session })
    music.comments.push(newComment)
    await music.save({ session })

    await session.commitTransaction()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't respin post.", 500))
  }

  res.status(201).json({ comment: newComment })
}

const deleteComment = async (req, res, next) => {
  const cid = req.params.cid

  let comment
  try {
    comment = await Comment.findById(cid).populate('musicPost')
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't delete comment.", 500))
  }

  if (!comment)
    return next(new HttpError('No comment found for provided ID.', 404))

  if (comment.creatorId.toString() !== req.user.id)
    return next(new HttpError('You are not allowed to delete this comment!', 401))

  try {
    const session = await mongoose.startSession()
    session.startTransaction()

    await Comment.findByIdAndDelete(comment._id, { session })
    comment.musicPost.comments.pull(comment)
    await comment.musicPost.save({ session })

    await session.commitTransaction()
  } catch (err) {
    console.log(err)
    return next(new HttpError("Database error, couldn't delete comment.", 500))
  }
  res.status(200).json({ message: 'Deleted comment.' })
}

exports.createComment = createComment
exports.deleteComment = deleteComment