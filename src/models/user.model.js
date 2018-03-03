'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const Schema = mongoose.Schema

const roles = [ 'nurse', 'doctor', 'admin' ]

const userSchema = new Schema({
  nic: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minlength: 9,
    maxlength: 12
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 128
  },
  name: {
    type: String,
    maxlength: 50
  },
  role: {
    type: String,
    default: 'nurse',
    enum: roles
  }
}, {
  timestamps: true
})

userSchema.pre('save', async function save (next) {
  try {
    if (!this.isModified('password')) {
      return next()
    }

    this.password = bcrypt.hashSync(this.password)

    return next()
  } catch (error) {
    return next(error)
  }
})

userSchema.method({
  transform () {
    const transformed = {}
    const fields = ['id', 'name', 'nic', 'createdAt', 'role']

    fields.forEach((field) => {
      transformed[field] = this[field]
    })

    return transformed
  },

  passwordMatches (password) {
    return bcrypt.compareSync(password, this.password)
  }
})

userSchema.statics = {
  roles,

  checkDuplicateNicError (err) {
    if (err.code === 11000) {
      var error = new Error('Nic already taken')
      error.errors = [{
        field: 'nic',
        location: 'body',
        messages: ['Nic already taken']
      }]
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  },

  async findAndGenerateToken (payload) {
    const { nic, password } = payload
    if (!nic) throw new APIError('Nic must be provided for login')

    const user = await this.findOne({ nic }).exec()
    if (!user) throw new APIError(`No user associated with ${nic}`, httpStatus.NOT_FOUND)

    const passwordOK = await user.passwordMatches(password)

    if (!passwordOK) throw new APIError(`Password mismatch`, httpStatus.UNAUTHORIZED)

    return user
  }
}

module.exports = mongoose.model('User', userSchema)
