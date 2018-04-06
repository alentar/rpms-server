'use strict'

const User = require('../models/user.model')
const Device = require('../models/device.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const DeviceError = require('../utils/DeviceError')
const ObjectId = require('mongoose').Types.ObjectId
const { pick } = require('lodash')

exports.selfAuthenticate = async (req, res, next) => {
  try {
    const mac = req.body.mac

    // find the device by mac address
    let device = await Device.findOne({ 'mac': mac })

    // if device was not found, register it
    if (!device) {
      const newDevice = new Device(req.body)
      device = await newDevice.save()

      User.notify('admin', {
        type: 'device',
        thumbnail: '/public/static/notifications/device-icon-48.png',
        title: 'New device wants to connect',
        content: 'A device wants to connect your system',
        action: 'navigate'
      })

      // we need to return that the device is registered
      res.status(httpStatus.CREATED)
      return res.json({
        'status': 'created',
        'deviceID': device._id
      })
    }

    if (device.isBlacklisted()) throw new DeviceError('Device blacklisted', 'blacklisted', httpStatus.FORBIDDEN)

    if (!device.isAuthorized()) throw new DeviceError('Device not authorized', 'unauthorized', httpStatus.FORBIDDEN)

    if (!device.isAssigned()) throw new DeviceError('Device not assigned', 'wait', httpStatus.FORBIDDEN)

    return res.json({id: device._id, status: 'operate'})
  } catch (error) {
    return next(error)
  }
}

exports.view = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findById(deviceId)

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({
      device
    })
  } catch (error) {
    return next(error)
  }
}

exports.delete = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findByIdAndRemove(deviceId)

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({
      'status': 'OK'
    })
  } catch (error) {
    return next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const update = pick(req.body, ['name'])
    const device = await Device.findByIdAndUpdate(deviceId, update, { new: true })

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({
      device
    })
  } catch (error) {
    return next(error)
  }
}

exports.index = async (req, res, next) => {
  try {
    const results = await Device.list(req.query)
    return res.json(results)
  } catch (error) {
    return next(error)
  }
}

exports.blacklist = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findByIdAndUpdate(deviceId, { blacklisted: true, authorized: false, assigned: false }, { new: true })
    // need to fire an event to inform socket connection

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({
      device
    })
  } catch (error) {
    return next(error)
  }
}

exports.whitelist = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findByIdAndUpdate(deviceId, { blacklisted: false }, { new: true })

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({
      device
    })
  } catch (error) {
    return next(error)
  }
}

exports.authorize = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findById(deviceId)

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)
    if (device.isBlacklisted()) throw new APIError('Blacklisted device', httpStatus.UNAUTHORIZED)

    device.authorized = true
    const savedDevice = await device.save()

    return res.json({
      device: savedDevice
    })
  } catch (error) {
    return next(error)
  }
}

exports.unauthorize = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findByIdAndUpdate(deviceId, { authorized: false, assigned: false }, { new: true })

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({
      device
    })
  } catch (error) {
    return next(error)
  }
}

exports.assign = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findById(deviceId)

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)
    if (device.isBlacklisted()) throw new APIError('Blacklisted device', httpStatus.UNAUTHORIZED)
    if (!device.isAuthorized()) throw new APIError('Unauthorized device', httpStatus.UNAUTHORIZED)

    device.assigned = true
    const savedDevice = await device.save()

    return res.json({
      device: savedDevice
    })
  } catch (error) {
    return next(error)
  }
}

exports.unassign = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId
    if (!ObjectId.isValid(deviceId)) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    const device = await Device.findByIdAndUpdate(deviceId, { assigned: false }, { new: true })

    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    return res.json({
      device
    })
  } catch (error) {
    return next(error)
  }
}
