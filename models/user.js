const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const crypto = require('crypto')

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

UserSchema.methods.validatePassword = function(password) {
  const incomingHash = crypto.pbkdf2Sync(password, this.salt, 1000, 512, 'sha512').toString('hex')

  return this.hash === incomingHash
}

UserSchema.plugin(uniqueValidator, {message: 'is already taken'})

mongoose.model('User', UserSchema)
