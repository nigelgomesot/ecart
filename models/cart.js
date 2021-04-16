const mongoose = require('mongoose')
const Product = mongoose.model('Product')
const CartItem = mongoose.model('CartItem')

// TODO: status as a list fo defined values

const CartSchema = new mongoose.Schema({
  items: [{type: mongoose.Schema.Types.ObjectId, ref: 'CartItem'}],
  customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  status: String,
  shippingAddress: {type: mongoose.Schema.Types.ObjectId, ref: 'Address'},
  paymentInfo: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment'}
}, {timestamps: true})

CartSchema.pre('validate', function(next) {
  if (!this.status)
    this.status = 'pending'

  next()
})


CartSchema.methods.addCartItem = function(incomingProduct) {
  return CartItem.find({_id: {$in: this.items}}).populate('product').then(cartItems => {
    const cartProductSlugs = cartItems.map(cartItem => cartItem.product.slug)

    if (cartProductSlugs.includes(incomingProduct.slug))
      return {'status': 'duplicate'}

    return Product.findOne({slug: incomingProduct.slug}).then(product => {
      if (!product)
        return {'status': 'product_not_found'}

      const cartItem = new CartItem()

      return cartItem.addProduct(product, incomingProduct.quantity).then(() => {
          this.items.push(cartItem)

          return this.save().then(() => {
            return {
              status: 'success',
              cartItem: cartItem.toJSON()
            }
          })
      })
    })
  })
}

CartSchema.methods.setPaymentStatus = function(paymentStatus) {
  switch(paymentStatus) {
    case 'success':
      this.status = 'payment_success'
      break
    default:
      this.status = 'payment_failed'
  }
}

CartSchema.methods.confirmPurchase = function(paymentInfo) {
  if (paymentInfo.status === 'success') {
    // INFO: random purchase status
    const purchaseStatus = (Math.random() < 0.5)

    switch(purchaseStatus) {
      case true:
        this.status = 'purchase_confirmed'
        break
      default:
        this.status = 'purchase_failed'
        break
    }

    return this.save().then(() => {
      return {
        'orderStatus': this.status,
        'paymentInfo': paymentInfo.toJSON()
      }
    })
  } else {
    return Promise.resolve({
      'orderStatus': this.status,
      'paymentInfo': paymentInfo.toJSON()
    })
  }
}

// TODO: use toProfileJSON for customer
CartSchema.methods.toJSON = function() {
  return {
    id: this._id,
    items: this.items,
    customer: this.customer.toProfileJSON(),
    status: this.status,
    shippingAddress: (this.shippingAddress ? this.shippingAddress.toJSON() : null),
    paymentInfo: (this.paymentInfo ? this.paymentInfo.toJSON() : null)
  }
}

mongoose.model('Cart', CartSchema)
