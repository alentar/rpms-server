'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const config = require('../config')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const Schema = mongoose.Schema

const roles = [ 'nurse', 'doctor', 'admin' ]
const genders = [ 'male', 'female' ]
const titles = [ 'mr', 'mrs', 'miss', 'ms' ]

const userSchema = new Schema({
  nic: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minlength: 10,
    maxlength: 12
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50
  },
  name: {
    type: String,
    required: true,
    maxlength: 150
  },
  registerID: {
    type: String,
    default: ''
  },
  contacts: [{type: String}],
  gender: {
    type: String,
    enum: genders,
    required: true
  },
  title: {
    type: String,
    enum: titles,
    required: true
  },
  role: {
    type: String,
    default: 'admin',
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

    this.password = bcrypt.hashSync(this.password) // replace with async version

    return next()
  } catch (error) {
    return next(error)
  }
})

userSchema.method({
  transform () {
    const transformed = {}
    const fields = ['id', 'name', 'nic', 'createdAt', 'role', 'registerID', 'contacts', 'gender', 'title']

    fields.forEach((field) => {
      transformed[field] = this[field]
    })

    return transformed
  },

  passwordMatches (password) {
    return bcrypt.compareSync(password, this.password)
  },

  token () {
    const payload = {
      exp: moment().add(config.tokenExpiration, 'hours').unix(),
      iat: moment().unix(),
      sub: this._id
    }

    return jwt.sign(payload, config.secret)
  }
})

userSchema.statics = {
  roles,

  genders,

  titles,

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
    const { nic, password, refreshObject } = payload

    // lets issue token if refreshObject is present
    if (refreshObject) {
      const user = await User.findOne({userID: refreshObject.userID})

      if (!user) throw new APIError(`Invalid token`, httpStatus.UNAUTHORIZED)

      return { user: user, accessToken: user.token() }
    }

    if (!nic) throw new APIError('Nic must be provided for login')

    const user = await this.findOne({ nic }).exec()
    if (!user) throw new APIError(`No user associated with ${nic}`, httpStatus.NOT_FOUND)

    const passwordOK = await user.passwordMatches(password)

    if (!passwordOK) throw new APIError(`Password mismatch`, httpStatus.UNAUTHORIZED)

    return { user: user, accessToken: user.token() }
  },

  async list ({page = 1, perPage = 30}) {
    page = Number(page)
    perPage = Number(perPage)

    if (!page || page <= 0) throw new APIError('Invalid page')
    if (!perPage || (perPage <= 0 && perPage !== -1)) throw new APIError('Invalid perPage')

    let results = null
    if (perPage === -1) {
      results = await User.find().sort({'createdAt': -1})
    } else {
      results = await User.find()
        .limit(perPage)
        .skip(perPage * (page - 1))
        .sort({'createdAt': -1})
    }

    const users = results.map((result) => result.transform())
    const total = await User.count()
    const pages = Math.ceil(total / perPage)

    return {users, pages, page, perPage, total}
  }
}

const User = mongoose.model('User', userSchema)
module.exports = User
