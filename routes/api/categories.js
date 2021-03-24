const router = require('express').Router()
const mongoose = require('mongoose')

const Product = mongoose.model('Product')

router.get('/', (req, res, next) => {
  Product.find().distinct('categoryList').then(categories => {
    return res.json({categories: categories})
  }).catch(next)
})

module.exports = router
