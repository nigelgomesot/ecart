const mongoose = require('mongoose')

// TODO: status as a list fo defined values

const CartSchema = new mongoose.Schema({
  items: [{type: mongoose.Schema.Types.ObjectId, ref: 'CartItem'}],
  customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  status: String,
  shippingAddress: {type: mongoose.Schema.Types.ObjectId, ref: 'Address'}
}, {timestamps: true})

CartSchema.pre('validate', function(next) {
  if (!this.status)
    this.status = 'pending'

  next()
})

// TODO: use toProfileJSON for customer
CartSchema.methods.toJSON = function() {
  return {
    id: this._id,
    items: this.items,
    customer: this.customer.toProfileJSON(),
    status: this.status,
    shippingAddress: (this.shippingAddress ? this.shippingAddress.toJSON() : null)
  }
}

mongoose.model('Cart', CartSchema)
