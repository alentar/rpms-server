'use strict'

const Ward = require('../models/ward.model')
const Device = require('../models/device.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const ObjectId = require('mongoose').Types.ObjectId

exports.create = async (req, res, next) => {
  try {
    const newBed = req.body
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)
    if (newBed.deviceId && !ObjectId.isValid(newBed.deviceId)) throw new APIError('Invalid device ID', httpStatus.INTERNAL_SERVER_ERROR)

    const ward = await Ward.findById(req.params.wardId)

    if (!ward) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    ward.beds.forEach(bed => {
      if (bed.number === newBed.number) {
        const error = new APIError('Bed number already exists')
        error.errors = [{
          field: 'bed',
          location: `bed.number`,
          message: 'Bed number already exists'
        }]

        throw error
      }
    })

    if (newBed.deviceId) { await Device.checkDeviceAssigned(newBed.deviceId) }

    ward.beds.push(newBed)

    const savedWard = await ward.save()

    return res.json({ward: savedWard})
  } catch (err) {
    return next(err)
  }
}

exports.delete = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.wardId) || !ObjectId.isValid(req.params.bedId)) {
      throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)
    }

    const ward = await Ward.findById(req.params.wardId)

    if (!ward) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    if (!ward.beds.find(bed => bed._id.equals(req.params.bedId))) {
      throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)
    }

    ward.beds.pull(req.params.bedId)
    const savedWard = await ward.save()

    return res.json({
      ward: savedWard
    })
  } catch (error) {
    return next(error)
  }
}

exports.view = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.wardId) || !ObjectId.isValid(req.params.bedId)) {
      throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)
    }

    const result = await Ward.findOne({
      _id: ObjectId(req.params.wardId)
    }, {
      beds: {
        $elemMatch: {
          _id: ObjectId(req.params.bedId)
        }
      }
    }).limit(1)

    if (result.beds.length === 0) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({ bed: result.beds[0] })
  } catch (error) {
    return next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    const newBed = req.body
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)
    if (newBed.deviceId && !ObjectId.isValid(newBed.deviceId)) throw new APIError('Invalid device ID', httpStatus.INTERNAL_SERVER_ERROR)

    const ward = await Ward.findById(req.params.wardId).where('beds._id').equals(req.params.bedId)

    if (!ward) throw new APIError('Invalid bed ID', httpStatus.INTERNAL_SERVER_ERROR)

    if (newBed.number) {
      ward.beds.forEach(bed => {
        if (!bed._id.equals(req.params.bedId) && bed.number === newBed.number) {
          const error = new APIError('Bed number already exists')
          error.errors = [{
            field: 'bed',
            location: `bed.number`,
            message: 'Bed number already exists'
          }]

          throw error
        }
      })
    }

    if (newBed.deviceId) { await Device.checkDeviceAssigned(newBed.deviceId) }

    const savedWard = await Ward.findOneAndUpdate({
      '_id': req.params.wardId,
      'beds._id': req.params.bedId
    }, {
      '$set': {
        'beds.$': newBed
      }
    }, {
      new: true
    })

    return res.json({ward: savedWard})
  } catch (err) {
    return next(err)
  }
}
