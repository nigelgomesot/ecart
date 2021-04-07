const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const slug =  require('slug')

const ProductSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true, required: [true, 'cannot be blank'], index: true},
  sku: {type: String, unique: true, required: [true, 'cannot be blank'], match: [/^[A-Z0-9]+$/, 'must be alphanumeric'], index: true},
  title: String,
  description: String,
  categoryList: [{type: String}],
  price: {type: Number, required: true}
}, {timestamps: true})

ProductSchema.plugin(uniqueValidator, {message: 'is already taken'})

ProductSchema.methods.slugify = function() {
  this.slug = this.sku + '-' + slug(this.title)
}

ProductSchema.pre('validate', function(next) {
  if (!this.slug)
    this.slugify()

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
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

mongoose.model('Product', ProductSchema)
