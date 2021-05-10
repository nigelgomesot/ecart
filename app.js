
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

let config = require('config');

mongoose.connect(config.DBHost)
mongoose.set('debug', true)

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

require('./models/user')
require('./models/product')
require('./models/cart_item')
require('./models/cart')
require('./models/address')
require('./models/payment_netbank')
require('./models/payment_card')
require('./models/payment')
require('./config/passport')
app.use(require('./routes'))

const server = app.listen(3001, () => {
  console.log('listening on post:', server.address().port)
})

module.exports = app
