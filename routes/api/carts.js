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

router.param('cartId', (req, res, next, cartId) => {
  Cart.findById(cartId).then(cart => {
    if (!cart)
      return res.sendStatus(404)

    req.cart = cart

    return next()
  }).catch(next)
})

// add product
router.put('/:cartId/addProduct', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if(!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

      return res.json({status: 'success'})
  }).catch(next)
})

module.exports = router
