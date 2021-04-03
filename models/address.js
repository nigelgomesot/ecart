const mongoose = require('mongoose')

const AddressSchema = new mongoose.Schema({
  street: {type: String, required: true},
  unit: {type: String, required: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  zipcode: {type: String, required: true},
  country: {type: String, required: true}
}, {timestamps: true})

AddressSchema.methods.toJSON = function() {
  return {
    street: this.street,
    unit: this.unit,
    city: this.city,
    state: this.state,
    zipcode: this.zipcode,
    country: this.country
  }
}

mongoose.model('Address', AddressSchema)
