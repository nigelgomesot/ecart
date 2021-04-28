const mongoose = require('mongoose')
const CartItem = mongoose.model('CartItem')
const PaymentNetbank = mongoose.model('PaymentNetbank')
const PaymentCard = mongoose.model('PaymentCard')

const countryShippingFeeMap = new Map()
countryShippingFeeMap.set('US', 0)
countryShippingFeeMap.set('DEFAULT', 0.3)

const PaymentSchema = new mongoose.Schema({
  payType: {type: String, required: true, enum: ['CC', 'DC', 'NB']},
  status: {type: String, required: true, enum: ['pending', 'success', 'failed']},
  baseAmount: {type: Number, required: true},
  totalFee: {type: Number, required: true},
  shippingFee: {type: Number, required: true},
  totalTax: {type: Number, required: true},
  totalAmount: {type: Number, required: true},

}, {timestamps: true})

PaymentSchema.pre('validate', function(next) {
  if (!this.status)
    this.status = 'pending'

  next()
})

PaymentSchema.methods.computeAmounts = function(cartItemIds, shippingCountryCode) {
  this.baseAmount = 0

  return CartItem.find({_id: {$in: cartItemIds}}).then(cartItems => {
    for (cartItem of cartItems) {
      this.baseAmount += cartItem.totalPrice
    }

    // TODO: integrate shippingCountryCode in API
    if (countryShippingFeeMap.has(shippingCountryCode))
      this.totalFee = this.baseAmount * countryShippingFeeMap.get(shippingCountryCode)
    else
      this.totalFee = this.baseAmount * countryShippingFeeMap.get('DEFAULT')

    this.totalFee = this.baseAmount * 0.2
    this.totalTax = this.baseAmount * 0.1
s
    this.totalAmount = this.baseAmount + this.totalFee + this.totalTax
  })
}

PaymentSchema.methods.confirmPayment = function(cart, paymentResponse) {
  this.status = paymentResponse.status

  return this.save().then(() => {
    switch(this.payType) {
      case 'NB':
        const paymentNetBank = new PaymentNetbank(paymentResponse)
        paymentNetBank.paymentInfo = this

        return paymentNetBank.save().then(() => paymentNetBank)

      case 'CC':
      case 'DC':
        const paymentCard = new PaymentCard(paymentResponse)
        paymentCard.paymentInfo = this

        return paymentCard.save().then(() => paymentCard)
    }
  }).then((paymentDetails) => {

    cart.setPaymentStatus(paymentResponse.status)

    return cart.save().then(() => {
      return {
        'orderStatus': cart.status,
        'paymentInfo': this.toJSON(),
        'paymentDetails': paymentDetails.toJSON()
      }
    })
  })
}

PaymentSchema.methods.toJSON = function() {
  return {
    payType: this.payType,
    status: this.status,
    baseAmount: this.baseAmount,
    totalFee: this.totalFee,
    totalTax: this.totalTax,
    totalAmount: this.totalAmount
  }
}

mongoose.model('Payment', PaymentSchema)
