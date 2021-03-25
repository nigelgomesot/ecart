
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/ecart')
mongoose.set('debug', true)

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

require('./models/user')
require('./models/product')
require('./models/cart_item')
require('./models/cart')
require('./config/passport')
app.use(require('./routes'))

const server = app.listen(3001, () => {
  console.log('listening on post:', server.address().port)
})
