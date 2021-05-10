const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

chai.use(chaiHttp)

const app = require('../../../app')
const mongoose = require('mongoose')
const Product = mongoose.model('Product')

describe('Products', () => {
  beforeEach(done => {
    Product.deleteMany().then(() => done())
  })

  // PENDING: Create a product

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
