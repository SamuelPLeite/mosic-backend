const express = require('express')
const { check } = require('express-validator')

const musicControllers = require('../controllers/music')
const commentControllers = require('../controllers/comments')
const { userExtractor } = require('../middleware/extractors')

const router = express.Router()

router.get('/respin', userExtractor, musicControllers.getRespinPosts)

router.get('/:mid', musicControllers.getPostById)

router.get('/user/:uid', musicControllers.getPostsByUserId)

router.post('/', userExtractor, [
  check('title').not().isEmpty(),
  check('artist').not().isEmpty(),
  check('isSong').isBoolean()
], musicControllers.createMusicPost)

router.post('/respin', userExtractor, musicControllers.createRespinPost)

router.post('/comment', userExtractor, commentControllers.createComment)

router.patch('/:mid', userExtractor, musicControllers.updateMusicPost)

router.delete('/:mid', userExtractor, musicControllers.deleteMusicPost)

router.delete('/respin/:mid', userExtractor, musicControllers.deleteRespinPost)

router.delete('/comment/:cid', userExtractor, commentControllers.deleteComment)

module.exports = router