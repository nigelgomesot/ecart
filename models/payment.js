const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  pay_type: {type: String, required: true},
  status: {type: String, required: true}
})

PaymentSchema.pre('validate', function(next) {
  if (!this.status)
    this.status = 'pending'

  next()
})

PaymentSchema.methods.toJSON = function() {
  return {
    pay_type: this.pay_type,
    status: this.status
  }
}

// Pending: validations for pay_type and status

mongoose.model('Payment', PaymentSchema)
