const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')

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

const getPostById = (req, res, next) => {
  const mid = req.params.mid

  const music = MUSIC.find(mus => mus.id === mid)

  if (!music)
    return next(new HttpError('Invalid Music ID, no post found.', 404))

  res.json({ music })
}

const getPostsByUserId = (req, res, next) => {
  const uid = req.params.uid

  const userMusic = MUSIC.filter(mus => mus.creatorId === uid)

  if (userMusic.length === 0)
    return next(new HttpError('No music posts found for the User ID.', 404))

  res.json({ userMusic })
}

const createMusicPost = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input detected.', 422))
  }

  const { title, artist, description, rating, isSong, creatorId } = req.body
  const newMusicPost = {
    id: uuidv4(),
    title,
    artist,
    description,
    rating,
    isSong,
    creatorId
  }

  MUSIC.push(newMusicPost)
  res.status(201).json({ music: newMusicPost })
}

const updateMusicPost = (req, res, next) => {
  const mid = req.params.mid
  const { description, rating } = req.body

  const music = MUSIC.find(mus => mus.id === mid)

  const updatedMusicPost = {
    ...music,
    description,
    rating,

  }

  MUSIC.splice(MUSIC.indexOf(music), 1, updatedMusicPost)
  res.status(200).json({ music: updatedMusicPost })
}

const deleteMusicPost = (req, res, next) => {
  const mid = req.params.mid
  if (!MUSIC.find(music => music.id === mid))
    return next(new HttpError('No place found with sent ID.', 404))

  MUSIC.splice(MUSIC.findIndex(mus => mus.id === mid), 1)
  res.status(200).json({ message: 'Deleted music post.' })
}

exports.getPostById = getPostById
exports.getPostsByUserId = getPostsByUserId
exports.createMusicPost = createMusicPost
exports.updateMusicPost = updateMusicPost
exports.deleteMusicPost = deleteMusicPost