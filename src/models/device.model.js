'use strict'

const mongoose = require('mongoose')
const httpStatus = require('http-status')

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

  chipID: {
    type: String
  },

  authenticated: {
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
  }
}

const Device = mongoose.model('Device', deviceSchema)
module.exports = Device
