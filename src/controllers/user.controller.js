'use strict'

const User = require('../models/user.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const ObjectId = require('mongoose').Types.ObjectId
const { omit, compact } = require('lodash')
const bcrypt = require('bcrypt-nodejs')

exports.create = async (req, res, next) => {
  try {
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

    if (!user) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({ user: user.transform() })
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
    const userObj = omit(req.body, compact([omitRole, 'id', '_id', omitPassword]))

    if (userObj.password) {
      userObj.password = bcrypt.hashSync(userObj.password)
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

exports.me = (req, res, next) => {
  return res.json(req.user.transform())
}
