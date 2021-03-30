const router = require('express').Router()
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Cart = mongoose.model('Cart')
const CartItem = mongoose.model('CartItem')
const Product = mongoose.model('Product')

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
  Cart.findById(cartId).populate('customer').then(cart => {
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

    const reqProduct = req.body.product
    const existingCartItemIds = req.cart.items

    // PENDING: return 409 if existing cartItem
    console.log('>>>>>>> existingCartItemIds',existingCartItemIds)

    if (existingCartItemIds) {
      CartItem.find({'_id': existingCartItemIds}).then(cartItems => {
        console.log('cartItems', cartItems)
      })
      // for (existingCartItemId of existingCartItemsIds) {

      //   CartItem.findById(existingCartItemId).populate('product').then(existingCartItem => {
      //     console.log('>>>>>>> existingCartItem',existingCartItem)
      //     if (existingCartItem.product.slug === reqProduct.slug)
      //       return res.sendStatus(409)
      //   })
      // }
    }

    Product.findOne({slug: reqProduct.slug}).then(product => {
      if (!product)
        return res.sendStatus(404)

      const cartItem = new CartItem({
        product: product,
        quantity: reqProduct.quantity
      })

      req.cart.items.push(cartItem)

      req.cart.save().then(() => {
        return res.json({
          status: 'success',
          cart: req.cart.toJSON()
        })
      }).catch(next)
    }).catch(next)
  }).catch(next)
})

module.exports = router
