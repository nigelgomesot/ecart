const router = require('express').Router()
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Product = mongoose.model('Product')
const auth = require('../auth')

router.param('product', (req, res, next, slug) => {
  // TODO: add CreatedBy
  Product.findOne({slug: slug})
    .then(product => {
      if (!product)
        return res.sendStatus(404)

        req.product = product

        return next()
    }).catch(next)
})

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

// get product
router.get('/:product', auth.optional, (req, res, next) => {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.product
  ]).then(results => {
    const user = results[0],
          product = results[1]

    return res.json({product: product.toJSONFor(user)})
  }).catch(next)
})

// update product
router.put('/:product', auth.required, (req, res, next) => {

  // TODO: save last modified by
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (typeof req.body.product.title != 'undefined')
      req.product.title = req.body.product.title

    if (typeof req.body.product.description != 'undefined')
      req.product.description = req.body.product.description

    req.product.save().then(() => {
      return res.json({product: req.product.toJSONFor(user)})
    }).catch(next)
  })
})

// delete product
router.delete('/:product', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    return req.product.remove().then(() => {
      return res.sendStatus(204)
    }).catch(next)
  })
})

module.exports = router
