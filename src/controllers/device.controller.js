'use strict'

const User = require('../models/user.model')
const Device = require('../models/device.model')
const Ward = require('../models/ward.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
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
        title: 'A new device wants to connect',
        content: 'A device wants to connect your system.',
        action: 'navigate',
        context: 'new'
      })

      global.io.emit('device', device)

      // we need to return that the device is registered
      res.status(httpStatus.CREATED)
      return res.json(deviceResponse(device._id, 'created', null))
    }

    if (device.isBlacklisted()) {
      res.status(httpStatus.FORBIDDEN)
      return res.json(deviceResponse(device._id, 'blacklisted', null))
    }

    if (!device.isAuthorized()) {
      res.status(httpStatus.FORBIDDEN)
      return res.json(deviceResponse(device._id, 'unauthorized', null))
    }

    if (!device.isAssigned()) {
      res.status(httpStatus.FORBIDDEN)
      return res.json(deviceResponse(device._id, 'unassigned', null))
    }

    if (!device.hasTopic()) {
      if (device.bed !== null) {
        const result = await Ward.findOne({
          _id: ObjectId(device.ward)
        }, {
          beds: {
            $elemMatch: {
              _id: ObjectId(device.bed)
            }
          }
        }).populate('beds.patient', '_id').limit(1)

        if (result.beds.length === 0) {
          await Device.findByIdAndUpdate(device._id, { bed: null, ward: null })
          res.status(httpStatus.FORBIDDEN)
          return res.json(deviceResponse(device._id, 'unassigned', null))
        }

        if (result.beds[0].patient !== null && result.beds[0].patient !== undefined) {
          const mqttTopic = `wards/${device.ward}/patient/${result.beds[0].patient._id}`
          await Device.findByIdAndUpdate(device._id, { mqttTopic: mqttTopic })
          return res.json(deviceResponse(device._id, 'operate', mqttTopic))
        } else {
          res.status(httpStatus.FORBIDDEN)
          return res.json(deviceResponse(device._id, 'unassigned', null))
        }
      }

      res.status(httpStatus.FORBIDDEN)
      return res.json(deviceResponse(device._id, 'unassigned', null))
    }

    return res.json(deviceResponse(device._id, 'operate', device.mqttTopic))
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

    const device = await Device.findById(deviceId)
    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    if (device.ward !== null) {
      const savedWard = await Ward.findOneAndUpdate({
        '_id': device.ward,
        'beds._id': device.bed
      }, {
        '$set': {
          'beds.$.device': null
        }
      }, {
        new: true
      })

      if (!savedWard) throw new APIError('Requested ward not found', httpStatus.NOT_FOUND)
    }

    device.blacklisted = true
    device.authorized = false
    device.assigned = false
    device.ward = null
    device.bed = null

    const saved = await device.save()
    // need to fire an event to inform socket connection

    return res.json({
      device: saved
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

    const device = await Device.findById(deviceId)
    if (!device) throw new APIError('Requested resource not found', httpStatus.NOT_FOUND)

    if (device.ward !== null) {
      const savedWard = await Ward.findOneAndUpdate({
        '_id': device.ward,
        'beds._id': device.bed
      }, {
        '$set': {
          'beds.$.device': null
        }
      }, {
        new: true
      })

      if (!savedWard) throw new APIError('Requested ward not found', httpStatus.NOT_FOUND)
    }

    device.authorized = false
    device.assigned = false
    device.ward = null
    device.bed = null

    const saved = await device.save()

    return res.json({
      device: saved
    })
  } catch (error) {
    return next(error)
  }
}

exports.attachDevice = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.deviceId)) throw new APIError('Requested device not found', httpStatus.NOT_FOUND)
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Requested ward not found', httpStatus.NOT_FOUND)
    if (!ObjectId.isValid(req.params.bedId)) throw new APIError('Requested bed not found', httpStatus.NOT_FOUND)

    const device = await Device.checkDeviceAssigned(req.params.deviceId)
    const savedWard = await Ward.findOneAndUpdate({
      '_id': req.params.wardId,
      'beds._id': req.params.bedId
    }, {
      '$set': {
        'beds.$.device': device._id
      }
    }, {
      new: true
    })

    if (!savedWard) throw new APIError('Requested ward not found', httpStatus.NOT_FOUND)

    device.assigned = true
    device.mqttTopic = null
    device.ward = req.params.wardId
    device.bed = req.params.bedId
    await device.save()

    const bed = savedWard.beds.find(v => ObjectId(req.params.bedId).equals())

    return res.json({
      device: device,
      bed: bed
    })
  } catch (error) {
    return next(error)
  }
}

exports.detachDevice = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.deviceId)) throw new APIError('Requested device not found', httpStatus.NOT_FOUND)
    if (!ObjectId.isValid(req.params.wardId)) throw new APIError('Requested ward not found', httpStatus.NOT_FOUND)
    if (!ObjectId.isValid(req.params.bedId)) throw new APIError('Requested bed not found', httpStatus.NOT_FOUND)

    const device = await Device.findByIdAndUpdate(req.params.deviceId, {
      assigned: false,
      mqttTopic: null,
      ward: null,
      bed: null
    }, {new: true})
    if (!device) throw new APIError('Requested device not found', httpStatus.NOT_FOUND)

    const savedWard = await Ward.findOneAndUpdate({
      '_id': req.params.wardId,
      'beds._id': req.params.bedId
    }, {
      '$set': {
        'beds.$.device': null
      }
    }, {
      new: true
    })

    if (!savedWard) throw new APIError('Requested ward not found', httpStatus.NOT_FOUND)

    const bed = savedWard.beds.find(v => ObjectId(req.params.bedId).equals())

    return res.json({
      device: device,
      bed: bed
    })
  } catch (error) {
    return next(error)
  }
}

const deviceResponse = (id, state, mqttTopic) => {
  return {id: id, state: state, mqttTopic: mqttTopic}
}
