const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

chai.use(chaiHttp)

const app = require('../../../app')
const mongoose = require('mongoose')
const Product = mongoose.model('Product')
const User = mongoose.model('User')

describe('Products', function() {
  beforeEach(function(done) {

    Promise.all([
      Product.deleteMany(),
      User.deleteMany()
    ]).then(() => done())
      .catch(() => done())

  })

  beforeEach(function(done) {
    const user = new User()
    user.username = 'test'
    user.email = 'test@test.com'
    user.setPassword('123456')

    user.save()
      .then(() => {
        this.user = user
        done()
      })
      .catch((err) => {
        console.error('error:', err)
        done()
      })
  })

  describe('POST /api/products', function() {
    it('creates a product', function(done) {
      let product = { "product":
        {
          "sku": "RN14",
          "title":"ring 14",
          "description":"a silver ring",
          "categoryList":["rings"],
          "price": 80
        }
      }

      chai.request(app)
        .post('/api/products')
        .set('Authorization', `Token ${this.user.generateJWT()}`)
        .send(product)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);

          Product.findOne({sku: 'RN14'}).then(dbProduct => {
            expect(dbProduct.slug).to.eql('rn14-ring-14')
            expect(dbProduct.title).to.eql('ring 14')
            expect(dbProduct.description).to.eql('a silver ring')
            expect(dbProduct.categoryList).to.eql(["rings"])
            expect(dbProduct.price).to.eql(80)
            expect(dbProduct.status).to.eql('activated')

            done()
          }).catch(err => done(err))
        })
    })
  })
})
