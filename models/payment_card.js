const mongoose = require('mongoose')

const PaymentCardSchema = new mongoose.Schema({
  paymentInfo: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment'},
  cardType: {type: String, required: true},
  cardNumber: {type: String, required: true},
  cvv: {type: String, required: true},
  expiry: {type: String, required: true},
  name: {type: String, required: true},
  txnRef: {type: Number, required: true},
  status: {type: String, required: true, enum: ['success', 'failed']},
}, {timestamps: true})

// TODO: validation for cardTypes
// TODO: store card number, cvv, expiry, as masked details

PaymentCardSchema.methods.toJSON = function() {
  return {
    cardType: this.cardType,
    txnRef: this.txnRef,
    status: this.status
  }
}

mongoose.model('PaymentCard', PaymentCardSchema)
