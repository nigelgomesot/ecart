const router = require('express').Router()
const passport = require('passport')
const mongoose = require('mongoose')

const User = mongoose.model('User')
const Cart = mongoose.model('Cart')
const CartItem = mongoose.model('CartItem')
const Product = mongoose.model('Product')
const Address = mongoose.model('Address')
const Payment = mongoose.model('Payment')
const PaymentNetbank = mongoose.model('PaymentNetbank')
const PaymentCard = mongoose.model('PaymentCard')

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
router.post('/:cartId/addProduct', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if(!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    CartItem.find({_id: {$in: req.cart.items}}).populate('product').then(cartItems => {
      const reqProduct = req.body.product
      const cartProductSlugs = cartItems.map(cartItem => cartItem.product.slug)

      if (cartProductSlugs.includes(reqProduct.slug))
        return res.sendStatus(409)

      Product.findOne({slug: reqProduct.slug}).then(product => {
        if (!product)
          return res.sendStatus(404)

        const cartItem = new CartItem()
        cartItem.product = product,
        cartItem.quantity = reqProduct.quantity
        cartItem.price = product.price
        cartItem.totalPrice = product.price * cartItem.quantity

        return cartItem.save().then(() => {
          req.cart.items.push(cartItem)

          req.cart.save().then(() => {
            return res.json({
              status: 'success',
              cartItem: cartItem.toJSON()
            })
          })
        })
      })
    })
  }).catch(next)
})

// remove product
router.delete('/:cartId/removeProduct', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    CartItem.find({_id: {$in: req.cart.items}}).populate('product').then(cartItems => {
      const reqProduct = req.body.product
      let cartItemForProduct = null

      for (cartItem of cartItems) {
        if (cartItem.product.slug === reqProduct.slug)
          cartItemForProduct = cartItem
      }

      if (!cartItemForProduct)
        return res.sendStatus(404)

      req.cart.items.remove(cartItemForProduct._id)

      req.cart.save().then(() => {
        CartItem.find({_id: cartItemForProduct._id}).remove().exec()
      }).then(() => {
        return res.sendStatus(204)
      })
    })
  }).catch(next)
})

// add address
router.post('/:cartId/AddShippingAddress', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    const shippingAddress = new Address(req.body.shippingAddress)

    return shippingAddress.save().then(() => {
      req.cart.shippingAddress = shippingAddress

      req.cart.save().then(() => {
        return res.json({
          status: 'success',
          shippingAddress: shippingAddress.toJSON()
        })
      })
    })
  }).catch(next)
})

// TODO: edit address

// add payment
// Pending: Payment Type details
router.post('/:cartId/addPaymentInfo', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    const paymentInfo = new Payment(req.body.paymentInfo)
    paymentInfo.computeAmounts(req.cart.items).then(() => {
      return paymentInfo.save().then(() => {
        req.cart.paymentInfo = paymentInfo

        req.cart.save().then(() => {
          return res.json({
            status: 'success',
            paymentInfo: paymentInfo.toJSON()
          })
        })
      })
    })
  }).catch(next)
})

// TODO: confirm Payment (add payment detals to PaymentInfo)
router.post('/:cartId/confirmPaymentInfo', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    const paymentInfo = Payment.findById(req.cart.paymentInfo).then(paymentInfo => {
      switch(paymentInfo.payType) {
        case 'NB':
          const paymentNetBank = new PaymentNetbank(req.body.paymentResponse)
          paymentNetBank.paymentInfo = paymentInfo

          return paymentNetBank.save().then(() => {
            return res.json({
              'status': 'success',
              'paymentDetails': paymentNetBank.toJSON()
            })
          })
          break

        case 'CC':
          const paymentCard = new PaymentCard(req.body.paymentResponse)
          paymentCard.paymentInfo = paymentInfo

          return paymentCard.save().then(() => {
            return res.json({
              'status': 'success',
              'paymentDetails': paymentCard.toJSON()
            })
          })
          break
      }
    })
  }).catch(next)
})

module.exports = router
