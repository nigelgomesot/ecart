const mongoose = require('mongoose')

const CartItemSchema = new mongoose.Schema({
  product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
  quantity: {type: Number, required: true},
  price: {type: Number, required: true},
  totalPrice: {type: Number, required: true}
}, {timestamps: true})

CartItemSchema.pre('validate', function(next) {
  if (!this.totalPrice)
    this.totalPrice = this.price * this.quantity

  next()
})

// TODO: Use toJSONFor for product
CartItemSchema.methods.toJSON = function() {
  return {
    id: this._id,
    product: this.product,
    quantity: this.quantity,
    price: this.price,
    totalPrice: this.totalPrice
  }
}

mongoose.model('CartItem', CartItemSchema)
