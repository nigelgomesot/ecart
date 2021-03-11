const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const crypto = require('crypto')
const jsonwebtoken =  require('jsonwebtoken')
// TODO: use env variable
const secret = crypto.randomBytes(16).toString('hex')

const UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, 'cannot be blank'], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, 'cannot be blank'], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  hash: String,
  salt: String
}, {timestamps: true})

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 512, 'sha512').toString('hex')
}

UserSchema.methods.validPassword = function(password) {
  const incomingHash = crypto.pbkdf2Sync(password, this.salt, 1000, 512, 'sha512').toString('hex')

  return this.hash === incomingHash
}

UserSchema.methods.generateJWT = function() {
  const today = new Date()
  let exp = new Date(today)

  exp.setDate(today.getDate() + 60)

  return jsonwebtoken.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, secret)
}

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    token: this.generateJWT()
  }
}

UserSchema.plugin(uniqueValidator, {message: 'is already taken'})

mongoose.model('User', UserSchema)
