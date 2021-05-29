const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

chai.use(chaiHttp)

const app = require('../../../app')
const mongoose = require('mongoose')
const User = mongoose.model('User')

describe('Users', function() {
  beforeEach(function(done) {
    Promise.all([
      User.deleteMany()
    ]).then(() => done())
      .catch((err) => done(err))
  })

  describe('POST /api/users', function() {
    it('registers an user', function(done) {
      let incomingUser = {
        "user":{
          "email":"testuser@test.com",
          "password":"test123456",
          "username":"testuser"
        }
      }

      chai.request(app)
        .post('/api/users')
        .send(incomingUser)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(201)
          expect(res.body.user.username).to.eql('testuser')

          // REF: https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
          const token = res.body.user.token,
                tokenPayload = token.split('.')[1],
                payloadBuffer = new Buffer(tokenPayload, 'base64'),
                payloadStr = payloadBuffer.toString('ascii')
                payloadJson = JSON.parse(payloadStr)

          expect(payloadJson.username).to.eql('testuser')

          User.findOne({username: 'testuser'}).then(dbUser => {
            expect(dbUser.email).to.eql('testuser@test.com')
            expect(dbUser.username).to.eql('testuser')
            expect(dbUser.validPassword('test123456')).to.be.true

            done()
          }).catch(err => done(err))
        })
    })

    it('returns error for invalid user details', function(done) {
      let incomingUser = {
        "user":{
          "email":"testuser@test.com",
          "password":"test123456",
          "username":"testuser@"
        }
      }

      chai.request(app)
        .post('/api/users')
        .send(incomingUser)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(422)
          expect(res.body.errors.username).to.eql('is invalid')

          User.findOne({username: 'testuser'}).then(dbUser => {
            expect(dbUser).to.be.null

            done()
          }).catch(err => done(err))
        })
    })

    describe('when user already exist', function() {
      beforeEach(function(done) {
        const existingUser = new User()
        existingUser.username = 'testuser'
        existingUser.email = 'testuser@test.com'
        existingUser.setPassword('test123456')

        existingUser.save()
          .then(() => {
            this.existingUser =  existingUser
            done()
          }).catch(err => {
            done(err)
          })
      })

      it('returns error', function(done) {
        let incomingUser = {
          "user":{
            "email":this.existingUser.email,
            "password":"test123456",
            "username": this.existingUser.username
          }
        }

        chai.request(app)
          .post('/api/users')
          .send(incomingUser)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(422)
            expect(res.body.errors.username).to.eql('is already taken')

            done()
          })
      })
    })
  })

  describe('POST /api/users/login', function() {
    describe('when user already exist', function() {
      beforeEach(function(done) {
        const existingUser = new User()
        existingUser.username = 'testuser'
        existingUser.email = 'testuser@test.com'
        existingUser.setPassword('test123456')

        existingUser.save()
          .then(() => {
            this.existingUser =  existingUser
            done()
          }).catch(err => {
            done(err)
          })
      })

      it('logs in the user', function(done) {
        let incomingUser = {
          "user": {
            "email": this.existingUser.email,
            "password": "test123456"
          }
        }

        chai.request(app)
          .post('/api/users/login')
          .send(incomingUser)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)

            const token = res.body.user.token,
                  tokenPayload = token.split('.')[1],
                  payloadBuffer = new Buffer(tokenPayload, 'base64'),
                  payloadStr = payloadBuffer.toString('ascii'),
                  payloadJson =  JSON.parse(payloadStr)

            expect(payloadJson.username).to.eql(this.existingUser.username)

            done()
          })
      })
    })
  })
})
