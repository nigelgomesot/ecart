const router = require('express').Router()
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Product = mongoose.model('Product')
const auth = require('../auth')

// create product
router.post('/', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    const product = new Product(req.body.product)

    // TODO: save createdBy

    return product.save().then(() => {
      return res.json({product: product.toJSONFor(user)})
    })
  }).catch(next)
})

module.exports = router
