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

      req.cart.addCartItem(req.body.product).then(addCartItemResponse => {
        switch(addCartItemResponse.status) {
          case 'duplicate':
            return res.sendStatus(409)
          case 'product_not_found':
            return res.sendStatus(404)
          case 'product_not_activated':
              return res.sendStatus(403)
          case 'success':
            return res.json(addCartItemResponse)
        }
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

    req.cart.removeCartItem(req.body.product).then(removeCartItemResponse => {
      switch(removeCartItemResponse.status) {
        case 'item_not_found':
          return res.sendStatus(404)
        case 'success':
          return res.sendStatus(204)
      }
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
router.put('/:cartId/EditShippingAddress', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    return Address.findById(req.cart.shippingAddress).then(shippingAddress => {
      if (!shippingAddress)
        return res.sendStatus(404)

      if (typeof req.body.shippingAddress.street != 'undefined')
        shippingAddress.street = req.body.shippingAddress.street

      if (typeof req.body.shippingAddress.unit != 'undefined')
        shippingAddress.unit = req.body.shippingAddress.unit

      if (typeof req.body.shippingAddress.city != 'undefined')
        shippingAddress.city = req.body.shippingAddress.city

      if (typeof req.body.shippingAddress.state != 'undefined')
        shippingAddress.state = req.body.shippingAddress.state

      if (typeof req.body.shippingAddress.zipcode != 'undefined')
        shippingAddress.zipcode = req.body.shippingAddress.zipcode

      if (typeof req.body.shippingAddress.country != 'undefined')
        shippingAddress.country = req.body.shippingAddress.country

      return shippingAddress.save().then(() => {
        return res.json({
          status: 'success',
          shippingAddress: shippingAddress.toJSON()
        })
      })
    })
  }).catch(next)
})

// add payment
router.post('/:cartId/addPaymentInfo', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    return Address.findById(req.cart.shippingAddress).then((shippingAddress) => {
      if (!shippingAddress)
        return res.sendStatus(404)

      const paymentInfo = new Payment(req.body.paymentInfo)
      return paymentInfo.computeAmounts(req.cart.items, shippingAddress).then(() => {
        return paymentInfo.save().then(() => {
          req.cart.paymentInfo = paymentInfo

          return req.cart.save().then(() => {
            return res.json({
              status: 'success',
              paymentInfo: paymentInfo.toJSON()
            })
          })
        })
      })
    })
  }).catch(next)
})

// confirm payment
router.post('/:cartId/confirmPaymentInfo', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    return Payment.findById(req.cart.paymentInfo).then(paymentInfo => {

      return paymentInfo.confirmPayment(req.cart, req.body.paymentResponse)
              .then(confirmPaymentResponse => {
        return res.json(confirmPaymentResponse)
      })
    })
  }).catch(next)
})

// confirm purchase
router.post('/:cartId/confirmPurchase', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (req.cart.customer._id.toString() != user._id.toString())
      return res.sendStatus(403)

    Payment.findById(req.cart.paymentInfo).then(paymentInfo => {
      return req.cart.confirmPurchase(paymentInfo).then(confirmPurchaseResponse => {
        return res.json(confirmPurchaseResponse)
      })
    })
  }).catch(next)
})


module.exports = router
