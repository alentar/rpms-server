'use strict'

const Ward = require('../models/ward.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const ObjectId = require('mongoose').Types.ObjectId
const _ = require('lodash')

exports.create = async (req, res, next) => {
  try {
    const ward = new Ward(_.omit(req.body, ['beds']))

    const savedWard = await ward.save()
    res.status(httpStatus.CREATED)
    res.send({
      ward: savedWard
    })
  } catch (err) {
    return next(Ward.checkDuplicateWardError(err))
  }
}

exports.delete = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Invalid resource identifier', httpStatus.NOT_FOUND)

    const ward = await Ward.findByIdAndRemove(req.params.wardId)

    if (!ward) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({success: true})
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Invalid resource identifier', httpStatus.NOT_FOUND)

    const wardObject = _.omit(req.body, ['beds'])
    const ward = await Ward.findByIdAndUpdate(req.params.wardId, wardObject, { new: true })

    if (!ward) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({ ward })
  } catch (error) {
    return next(Ward.checkDuplicateWardError(error))
  }
}

exports.view = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Invalid resource identifier', httpStatus.NOT_FOUND)

    const ward = await Ward.findById(req.params.wardId)

    if (!ward) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({ ward })
  } catch (error) {
    return next(error)
  }
}

exports.index = async (req, res, next) => {
  try {
    const result = await Ward.list(req.query)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}
