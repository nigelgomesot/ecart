const router = require('express').Router()

router.use('/', require('./users'))
router.use('/products', require('./products'))
router.use('/categories', require('./categories'))
router.use('/carts', require('./carts'))

router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message

        return errors
      }, {})
    })
  }

  return next(err)
})

module.exports = router
