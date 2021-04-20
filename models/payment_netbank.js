const mongoose = require('mongoose')

const PaymentNetbankSchema = new mongoose.Schema({
  paymentInfo: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment'},
  bankId: {type: Number, required: true},
  txnRef: {type: Number, required: true},
  status: {type: String, required: true, enum: ['success', 'failed']},
}, {timestamps: true})

PaymentNetbankSchema.methods.toJSON = function() {
  return {
    bankId: this.bankId,
    txnRef: this.txnRef,
    status: this.status
  }
}

mongoose.model('PaymentNetbank', PaymentNetbankSchema)
