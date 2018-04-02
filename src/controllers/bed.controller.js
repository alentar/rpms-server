'use strict'

const Ward = require('../models/ward.model')
const Bed = require('../models/bed.model').Bed
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

    const bed = new Bed(newBed)
    ward.beds.push(bed)
    await ward.save()

    return res.json({ bed })
  } catch (err) {
    return next(err)
  }
}

exports.bulkCreate = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const ward = await Ward.findById(req.params.wardId)
    if (!ward) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    let excludes = []
    let beds = []
    const start = req.body.start
    const end = req.body.end

    ward.beds.forEach(bed => {
      if (bed.number >= start && bed.number <= end) excludes.push(bed.number)
    })

    for (let index = start; index <= end; index++) {
      if (excludes.includes(index)) continue

      beds.push(new Bed({ number: index }))
    }

    // Save ward with new beds
    await Ward.findByIdAndUpdate(req.params.wardId, {
      $push: {
        'beds': {
          $each: beds
        }
      }
    })

    return res.json({ beds })
  } catch (error) {
    return next(error)
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
    await ward.save()

    return res.json({
      success: true
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
    const updateSchema = {}
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

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

      updateSchema['beds.$.number'] = newBed.number
    }

    const savedWard = await Ward.findOneAndUpdate({
      '_id': req.params.wardId,
      'beds._id': req.params.bedId
    }, {
      '$set': updateSchema
    }, {
      new: true
    })

    const bed = savedWard.beds.find(bed => bed._id.equals(req.params.bedId))

    return res.json({ bed })
  } catch (err) {
    return next(err)
  }
}
