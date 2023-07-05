const express = require('express')
const axios = require('axios')

const router = express.Router()

router.get('/', async (req, res, next) => {
  const { title, artist, isSong } = req.body

  const isTrackString = isSong ? 'track' : 'album'
  const queryString = `https://api.deezer.com/search/${isTrackString}?q=artist:"${artist}" ${isTrackString}:"${title}"`
  console.log(queryString)

  const response = await axios.get(queryString)
  console.log(response.data)

  res.json({ data: response.data.data[0] })
})

module.exports = router