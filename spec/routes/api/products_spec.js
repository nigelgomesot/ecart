const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

chai.use(chaiHttp)

const app = require('../../../app')
const mongoose = require('mongoose')
const Product = mongoose.model('Product')
const User = mongoose.model('User')

describe('Products', () => {
  let user

  beforeEach(done => {
    Product.deleteMany().then(() => done())
  })

  beforeEach(done => {
    const u = new User()
    u.uname = 'test'
    u.email = 'test@test.com'
    u.setPassword('123456')

    u.save().then(() => {
      user = u

      done()
    })
  })

  // PENDING: Create a product
  describe('POST /api/products', () => {
    it('should create a product', done => {
      let product = { "product":
        {
          "sku": "RN14",
          "title":"ring 14",
          "description":"a silver ring",
          "categoryList":["rings"], "price": 80
        }
      }

      chai.request(app)
        .post('/api/products')
        .send(product)
        .end((err, response) => {
          response.should.have.status(201)
        })
    })
  })

  // TODO: fetch specific product
  // describe('GET /api/products', () => {
  //   it('should fetch all the products', done => {
  //     chai.request(app)
  //       .get('/api/products')
  //       .end((err, response) => {
  //         response.should.have.status(200)
  //         response.body.should.be.a('array')
  //         response.body.length.should.be.eql(0)

  //         done()
  //       })
  //   })
  // })
})
