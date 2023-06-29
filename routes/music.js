const express = require('express')
const { check } = require('express-validator')

const musicControllers = require('../controllers/music')

const router = express.Router()

router.get('/:mid', musicControllers.getPostById)

router.get('/user/:uid', musicControllers.getPostsByUserId)

router.post('/', [
  check('title').not().isEmpty(),
  check('artist').not().isEmpty(),
  check('isSong').isBoolean(),
  check('creatorId').not().isEmpty()
], musicControllers.createMusicPost)

router.patch('/:mid', musicControllers.updateMusicPost)

router.delete('/:mid', musicControllers.deleteMusicPost)

module.exports = router