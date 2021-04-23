const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const slug =  require('slug')

const ProductSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true, required: [true, 'cannot be blank'], index: true},
  sku: {type: String, unique: true, required: [true, 'cannot be blank'], match: [/^[A-Z0-9]+$/, 'must be alphanumeric'], index: true},
  title: String,
  description: String,
  categoryList: [{type: String, enum: ['rings', 'chains']}],
  price: {type: Number, required: true},
  status: {type: String, enum: ['activated', 'deactivated']}
}, {timestamps: true})

ProductSchema.plugin(uniqueValidator, {message: 'is already taken'})

ProductSchema.methods.slugify = function() {
  this.slug = this.sku + '-' + slug(this.title)
}

ProductSchema.pre('validate', function(next) {
  if (!this.slug)
    this.slugify()

  if (!this.status)
    this.status = 'activated'

  next()
})

ProductSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    sku: this.sku,
    title: this.title,
    description: this.description,
    categoryList: this.categoryList,
    price: this.price,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

mongoose.model('Product', ProductSchema)
