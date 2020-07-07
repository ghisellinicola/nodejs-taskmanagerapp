const express = require('express')
const router = new express.Router()

router.get('/test', (req,res) => {
    res.send('This is from my test router')
})

module.exports = router