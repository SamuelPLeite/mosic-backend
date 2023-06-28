const express = require('express')

const musicControllers = require('../controllers/music')

const router = express.Router()

router.get('/:mid', musicControllers.getPostById)

router.get('/user/:uid', musicControllers.getPostsByUserId)

router.post('/', musicControllers.createMusicPost)

router.patch('/:mid', musicControllers.updateMusicPost)

module.exports = router