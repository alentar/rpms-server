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
  },

  blacklisted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

deviceSchema.method({
  isAuthorized () {
    return this.authorized === true
  },

  isAssigned () {
    return this.assigned === true
  },

  isBlacklisted () {
    return this.blacklisted === true
  }
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
    if (!device.isAuthorized()) throw new APIError('Unauthorized device')
    if (device.isAssigned()) throw new APIError('Device already assigned for a beds')

    return Promise.resolve(false)
  },

  async getAuthorizedDevices () {
    const devices = await Device.find({}).where('authorized').equals(true)
    return devices
  },

  async getUnAuthorizedDevices () {
    const devices = await Device.find({}).where('authorized').equals(false)
    return devices
  },

  async getAssignedDevices () {
    const devices = await Device.find({}).where('authorized').equals(true).where('assigned').equals(true)
    return devices
  },

  async getUnAssignedDevices () {
    const devices = await Device.find({}).where('authorized').equals(true).where('assigned').equals(false
    )
    return devices
  },

  async list ({page = 1, perPage = 30, type = 'all', order = 'desc'}) {
    page = Number(page)
    perPage = Number(perPage)

    if (!page || page <= 0) throw new APIError('Invalid page')
    if (!perPage || (perPage <= 0 && perPage !== -1)) throw new APIError('Invalid perPage')
    order = (order === 'asc' ? 1 : -1)
    const find = {}

    switch (type) {
      case 'blacklisted':
        find['blacklisted'] = true
        break

      case 'whitelisted':
        find['blacklisted'] = false
        break

      case 'authorized':
        find['blacklisted'] = false
        find['authorized'] = true
        break

      case 'unauthorized':
        find['blacklisted'] = false
        find['authorized'] = false
        find['assigned'] = false
        break

      case 'assigned':
        find['blacklisted'] = false
        find['authorized'] = true
        find['assigned'] = true
        break

      case 'unassigned':
        find['blacklisted'] = false
        find['authorized'] = true
        find['assigned'] = false
        break

      default:
        break
    }

    let results = null
    if (perPage === -1) {
      results = await Device.find(find).sort({'createdAt': order})
      perPage = 1
    } else {
      results = await Device.find(find)
        .limit(perPage)
        .skip(perPage * (page - 1))
        .sort({'createdAt': order})
    }

    const devices = results
    const total = await Device.find(find).count()
    const pages = Math.ceil(total / perPage)

    return {devices, pages, page, perPage, total}
  }
}

const Device = mongoose.model('Device', deviceSchema)
module.exports = Device
