'use strict'

const User = require('../models/user.model')
const Notfication = require('../models/notification.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const ObjectId = require('mongoose').Types.ObjectId
const { pick, compact } = require('lodash')
const bcrypt = require('bcrypt-nodejs')

exports.create = async (req, res, next) => {
  try {
    if (req.body.name) {
      req.body.name = req.body.name
        .match(/\S+/g).map((word) => {
          return word[0].toUpperCase() + word.substr(1).toLowerCase()
        }).join(' ')
    }
    if (!req.body.password) req.body.password = req.body.nic
    const user = new User(req.body)
    const savedUser = await user.save()
    res.status(httpStatus.CREATED)
    res.send({
      user: savedUser.transform()
    })
  } catch (error) {
    return next(User.checkDuplicateNicError(error))
  }
}

exports.view = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.userID)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const user = await User.findById(req.params.userID)
      .select('-password -notifications')

    if (!user) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({ user })
  } catch (error) {
    return next(error)
  }
}

exports.delete = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.userID)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const user = await User.findByIdAndRemove(req.params.userID)

    if (!user) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({success: true})
  } catch (error) {
    return next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.userID)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const omitRole = req.user.role !== 'admin' ? 'role' : ''
    const omitPassword = (req.user.role === 'admin' && req.user.id !== req.params.userID) ? '' : 'password'
    const userObj = pick(req.body, compact([omitRole, omitPassword, 'name', 'registerID', 'nic', 'contacts', 'gender', 'title']))

    if (userObj.password) {
      userObj.password = bcrypt.hashSync(userObj.password)
    }

    if (userObj.name) {
      userObj.name = userObj.name
        .match(/\S+/g).map((word) => {
          return word[0].toUpperCase() + word.substr(1).toLowerCase()
        }).join(' ')
    }

    const user = await User.findByIdAndUpdate(req.params.userID, userObj, {new: true})
    return res.json({user: user.transform()})
  } catch (error) {
    return next(User.checkDuplicateNicError(error))
  }
}

exports.index = async (req, res, next) => {
  try {
    const result = await User.list(req.query)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({path: 'notifications', options: { sort: { createdAt: -1 }, limit: 10 }})
      .select('-password')

    return res.json({ user })
  } catch (error) {
    return next(error)
  }
}

exports.myNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id

    const notifications = await User
      .findById(userId)
      .populate({path: 'notifications', options: { sort: { createdAt: -1 } }})
      .select('notifications')

    return res.json(notifications)
  } catch (error) {
    return next(error)
  }
}

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id
    console.log(req.user)

    const notficationId = req.params.notificationId
    if (!ObjectId.isValid(notficationId)) throw new APIError('Invalid notification', httpStatus.NOT_FOUND)

    // check if user has this notification
    const user = await User.findOne({ _id: ObjectId(userId), notifications: ObjectId(notficationId) })

    if (!user) throw new APIError('Resource not avaliable', httpStatus.UNAUTHORIZED)

    if (!req.query.read || !['true', 'false'].includes(req.query.read)) {
      req.query.read = 'true'
    }

    const result = await Notfication.findByIdAndUpdate(notficationId, { read: req.query.read === 'true' }, { new: true })
    if (result === null) throw new APIError('Something went wrong')
    return res.json({ _id: result._id, read: result.read })
  } catch (error) {
    return next(error)
  }
}
