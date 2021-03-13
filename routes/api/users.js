const router = require('exresss').Router()
const passport = require('passport')
const auth = require('../auth')
const mongoose = require('mongoose')
const User = mongoose.model('User')

router.post('/users', (req, res, next) => {
  const user = new User()

  user.username = req.body.user.username
  user.email = req.body.user.email
  user.setPassword(req.body.user.password)

  user.save().then(() => {
    return res.json({user: user.toAuthJSON()})
  }).catch(next)
})

module.exports = router
