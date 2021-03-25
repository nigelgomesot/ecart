const mongoose = require('mongoose')

const CartItemSchema = new mongoose.Schema({
  product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
  quantity: Number,
}, {timestamps: true})

// TODO: Use toJSONFor for product
CartItemSchema.methods.toJSON = function() {
  return {
    product: this.product,
    quantity: this.quantity
  }
}

mongoose.model('CartItem', CartItemSchema)
