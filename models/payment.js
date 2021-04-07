const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  payType: {type: String, required: true},
  status: {type: String, required: true},
  baseAmount: {type: Number, required: true},
  totalFee: {type: Number, required: true},
  totalTax: {type: Number, required: true},
  totalAmount: {type: Number, required: true},

}, {timestamps: true})

PaymentSchema.pre('validate', function(next) {
  if (!this.status)
    this.status = 'pending'

  next()
})

PaymentSchema.methods.computeAmounts = function(cartItems) {
  this.baseAmount = 0

  for (let cartItem of cartItems) {
    this.baseAmount += cartItem.totalPrice
  }

  this.totalFee = this.baseAmount * 0.2
  this.totalTax = this.baseAmount * 0.1

  this.totalAmount = this.baseAmount + this.totalFee + this.totalTax
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

// Pending: validations for payType and status

mongoose.model('Payment', PaymentSchema)
