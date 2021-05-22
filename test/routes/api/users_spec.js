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
      User.deleteMany
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

          User.findOne({username: 'testuser'}).then(dbUser => {
            expect(dbUser.email).to.eql('testuser@test.com')
            expect(dbUser.username).to.eql('testuser')
            expect(dbUser.validPassword('test123456')).to.be.true

            // PENDING: validate response body
            done()
          }).catch(err => done(err))
        })
    })
  })
})
