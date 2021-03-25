const mongoose = require('mongoose')

// TODO: status as a list fo defined values

const CartSchema = new mongoose.Schema({
  items: [{type: mongoose.Schema.Types.ObjectId, ref: 'CartItem'}],
  customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  status: String
}, {timestamps: true})

CartSchema.pre('validate', function(next) {
  if (!this.status)
    this.status = 'pending'

  next()
})

// TODO: use toProfileJSON for customer
CartSchema.methods.toJSON = function() {
  return {
    items: this.items,
    customer: this.customer,
    status: this.status
  }
}

mongoose.model('Cart', CartSchema)
