const router = require('express').Router()
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Cart = mongoose.model('Cart')
const auth = require('../auth')

// create cart
router.post('/', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    const cart = new Cart()
    cart.customer = user

    return cart.save().then(() => {
      return res.json({cart: cart.toJSON()})
    })
  }).catch(next)
})

module.exports = router
