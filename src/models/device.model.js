'use strict'

const mongoose = require('mongoose')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 40,
    default: ''
  },

  mac: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  chipId: {
    type: String
  },

  authorized: {
    type: Boolean,
    default: false
  },

  assigned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

deviceSchema.statics = {
  checkDuplicateDeviceError (err) {
    if (err.code === 11000) {
      var error = new Error('Device already exists')
      error.errors = [{
        field: 'mac',
        location: 'body',
        messages: ['Device already exists']
      }]
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  },

  async checkDeviceAssigned (deviceId) {
    const device = await Device.findById(deviceId)
    if (!device) throw new APIError('Device not found', httpStatus.NOT_FOUND)
    if (device.authorized === false) throw new APIError('Unauthorized device')
    if (device.assigned === true) throw new APIError('Device already assigned for a bed')
  }
}

const Device = mongoose.model('Device', deviceSchema)
module.exports = Device
