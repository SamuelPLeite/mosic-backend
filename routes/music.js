const express = require('express')
const { check } = require('express-validator')

const musicControllers = require('../controllers/music')
const { userExtractor } = require('../middleware/extractors')

const router = express.Router()

router.get('/:mid', musicControllers.getPostById)

router.get('/user/:uid', musicControllers.getPostsByUserId)

router.post('/', userExtractor, [
  check('title').not().isEmpty(),
  check('artist').not().isEmpty(),
  check('isSong').isBoolean()
], musicControllers.createMusicPost)

router.patch('/:mid', userExtractor, musicControllers.updateMusicPost)

router.delete('/:mid', userExtractor, musicControllers.deleteMusicPost)

module.exports = router