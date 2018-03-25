'use strict'

const Ward = require('../models/ward.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const ObjectId = require('mongoose').Types.ObjectId

exports.create = async (req, res, next) => {
  try {
    const ward = new Ward(req.body)

    if (req.body.beds) {
      const err = new APIError('Invalid ObjectId')
      err.errors = []
      let hasError = false
      req.body.beds.forEach(bed => {
        if (bed.deviceID !== undefined && bed.deviceID !== null && bed.deviceID !== '' && !ObjectId.isValid(bed.deviceID)) {
          hasError = true
          err.errors.push({
            field: bed,
            error: 'Invalid ObjectId'
          })
        }
      })

      if (hasError) throw err
    }

    const savedWard = await ward.save()
    res.status(httpStatus.CREATED)
    res.send({
      ward: savedWard
    })
  } catch (err) {
    return next(Ward.checkDuplicateWardeError(err))
  }
}

exports.delete = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const ward = await Ward.findByIdAndRemove(req.params.wardId)

    if (!ward) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({success: true})
  } catch (err) {
    next(err)
  }
}

exports.addBeds = async (req, res, next) => {
  try {

  } catch (err) {
    return next(err)
  }
}
