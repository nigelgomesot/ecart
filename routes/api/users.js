const router = require('express').Router()
const passport = require('passport')
const auth = require('../auth')
const mongoose = require('mongoose')
const User = mongoose.model('User')

// user signup
router.post('/users', (req, res, next) => {
  const user = new User()
  user.username = req.body.user.username
  user.email = req.body.user.email
  user.setPassword(req.body.user.password)

  user.save().then(() => {
    return res.json({user: user.toAuthJSON()})
  }).catch(next)
})

// user signin
router.post('/users/login', (req, res, next) => {
  if (!req.body.user.email)
    return res.sendStatus(422).json({errors: {email: 'cannot be blank'}})

  if (!req.body.user.password)
    return res.sendStatus(422).json({errors: {password: 'cannot be blank'}})

  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err)
      return next(err)

    if (user) {
      user.token = user.generateJWT()

      return res.json({user: user.toAuthJSON()})
    } else {
      return res.status(422).json(info)
    }
  })(req, res, next)
})


module.exports = router
