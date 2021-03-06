'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const config = require('../config')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const Schema = mongoose.Schema
const Notification = require('./notification.model')
const queue = require('../services/kue')
const sockets = require('../utils/sockets')

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
    maxlength: 100
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
  },
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }
  ]
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
    const fields = [
      '_id',
      'name',
      'nic',
      'createdAt',
      'role',
      'registerID',
      'contacts',
      'gender',
      'title',
      'notifications',
      'unread'
    ]

    fields.forEach((field) => {
      if (field in this) transformed[field] = this[field]
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

  notify (role = 'admin', payload) {
    const critaria = {}
    if (role !== 'all') critaria['role'] = role

    const job = queue.create('bulk_notifications', {
      critaria, payload
    })

    job.save()
  },

  async sendBulkNotifications (critaria, payload) {
    const users = await User.find(critaria)

    for (let i = 0; i < users.length; i++) {
      const notification = new Notification(payload)
      await notification.save()
      await sockets.sendMessageToUser('notification', notification, users[i]._id)
      users[i].notifications.push(notification._id)
      await users[i].save()
    }

    console.log(users.length, 'was awared')
    return Promise.resolve()
  },

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

  async getUnreadNotifications (id) {
    const results = await User.aggregate([
      {
        $match: {
          _id: { $eq: mongoose.Types.ObjectId(id) }
        }
      },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notifications',
          foreignField: '_id',
          as: 'notification'
        }
      },
      {
        $unwind: '$notification'
      },
      {
        $match: {
          'notification.read': false
        }
      }, {
        $count: 'unread'
      }
    ])

    console.log(results)

    if (results.length === 0) return Promise.resolve(0)
    return Promise.resolve(results[0].unread)
  },

  async findAndGenerateToken (payload) {
    const { nic, password, refreshObject } = payload

    // lets issue token if refreshObject is present
    if (refreshObject) {
      const user = await User.findById(refreshObject.userId)
        .populate({path: 'notifications', options: { sort: { createdAt: -1 }, limit: 10 }})
        .select('-password')
        .exec()

      if (!user) throw new APIError(`Invalid token`, httpStatus.UNAUTHORIZED)

      user.unread = await User.getUnreadNotifications(refreshObject.userId)
      return { user: user, accessToken: user.token() }
    }

    if (!nic) throw new APIError('Nic must be provided for login')

    const user = await User.findOne({ 'nic': nic })
      .populate({path: 'notifications', options: { sort: { createdAt: -1 }, limit: 10 }})

    if (!user) throw new APIError(`No user associated with ${nic}`, httpStatus.NOT_FOUND)

    const passwordOK = await user.passwordMatches(password)

    if (!passwordOK) throw new APIError(`Password mismatch`, httpStatus.UNAUTHORIZED)

    user.unread = await User.getUnreadNotifications(user._id)

    return { user: user, accessToken: user.token() }
  },

  async list ({ page = 1, perPage = 30, sortBy = 'createdAt', role = 'all', order = 'desc' }) {
    page = Number(page)
    perPage = Number(perPage)

    if (!page || page <= 0) throw new APIError('Invalid page')
    if (!perPage || (perPage <= 0 && perPage !== -1)) throw new APIError('Invalid perPage')
    order = (order === 'asc' ? 1 : -1)

    const fields = ['name', 'nic', 'createdAt', 'role', 'registerID', 'contacts', 'gender', 'title']
    sortBy = !fields.includes(sortBy) ? 'createdAt' : sortBy
    const sorter = {}
    sorter[sortBy] = order

    const find = {}
    if (User.roles.includes(role)) find['role'] = role

    let results = null
    if (perPage === -1) {
      results = await User.find(find).select('-password -notifications').sort(sorter)
      perPage = 1
    } else {
      results = await User.find(find)
        .select('-password -notifications')
        .limit(perPage)
        .skip(perPage * (page - 1))
        .sort(sorter)
    }

    const total = await User.find(find).count()
    const pages = Math.ceil(total / perPage)

    return {users: results, pages, page, perPage, total}
  }
}

const User = mongoose.model('User', userSchema)
module.exports = User
