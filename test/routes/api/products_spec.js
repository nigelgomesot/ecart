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
          expect(err).to.be.null
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

    it('returns error if product already exist', function(done) {
      existingProduct = new Product()
      existingProduct.sku = "RN14"
      existingProduct.title = "ring 14"
      existingProduct.description = "a silver ring"
      existingProduct.categoryList = ["rings"]
      existingProduct.price = 80

      existingProduct.save().then(() => {
        let product = { "product":
          {
            "sku": existingProduct.sku,
            "title": existingProduct.title,
            "description": existingProduct.description,
            "categoryList": existingProduct.categoryList,
            "price": existingProduct.price
          }
        }

        chai.request(app)
          .post('/api/products')
          .set('Authorization', `Token ${this.user.generateJWT()}`)
          .send(product)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(422);
            expect(res.body.errors.sku).to.eql('is already taken')

            done()
          })
      })
    })
  })

  describe('GET /api/products', function() {
    beforeEach(function(done) {
      product = new Product()
      product.sku = "RN14"
      product.title = "ring 14"
      product.description = "a silver ring"
      product.categoryList = ["rings"]
      product.price = 80

      product.save().then(() => {
        this.product = product

        done()
      }).catch((err) => {
        console.error('error:', err)
        done()
      })
    })

    it('fetches a product', function(done) {
      chai.request(app)
        .get(`/api/products/${this.product.slug}`)
        .set('Authorization', `Token ${this.user.generateJWT()}`)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200);
          expect(res.body.product.sku).to.eql('RN14')

          done()
        })
    })

    it('returns error for non-existent product', function(done) {
      const nonExistentSlug = 'non-existent-slug'

      chai.request(app)
        .get(`/api/products/${nonExistentSlug}`)
        .set('Authorization', `Token ${this.user.generateJWT()}`)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(404);

          done()
        })
    })
  })

  describe('PUT /api/products', function() {
    beforeEach(function(done) {
      product = new Product()
      product.sku = "RN14"
      product.title = "ring 14"
      product.description = "a silver ring"
      product.categoryList = ["rings"]
      product.price = 80

      product.save().then(() => {
        this.product = product

        done()
      }).catch((err) => {
        console.error('error:', err)
        done()
      })
    })

    it('updates a product', function(done) {
      let updatedProduct = { "product":
        {
          "description":"a metal ring",
          "price": 30
        }
      }

      chai.request(app)
        .put(`/api/products/${this.product.slug}`)
        .set('Authorization', `Token ${this.user.generateJWT()}`)
        .send(updatedProduct)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res.body.product.description).to.eql('a metal ring')
          expect(res.body.product.price).to.eql(30)

          done()
        })
    })

    it('returns error for bad product details', function(done) {
      let updatedProduct = { "product":
        {
          "status": 'invalid-status'
        }
      }

      chai.request(app)
        .put(`/api/products/${this.product.slug}`)
        .set('Authorization', `Token ${this.user.generateJWT()}`)
        .send(updatedProduct)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(422);
          expect(res.body.errors.status).to.include('is not a valid enum')

          done()
        })
    })
  })

  describe('DELETE /api/products', function() {
    beforeEach(function(done) {
      product = new Product()
      product.sku = "RN14"
      product.title = "ring 14"
      product.description = "a silver ring"
      product.categoryList = ["rings"]
      product.price = 80

      product.save().then(() => {
        this.product = product

        done()
      }).catch((err) => {
        console.error('error:', err)
        done()
      })
    })

    it('deletes a product', function(done) {
      chai.request(app)
        .delete(`/api/products/${this.product.slug}`)
        .set('Authorization', `Token ${this.user.generateJWT()}`)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(204);

          Product.findOne({sku: 'RN14'}).then(dbProduct => {
            expect(dbProduct).to.be.null

            done()
          }).catch(err => done(err))
        })
    })
  })
})
