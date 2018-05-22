'use strict'
const httpStatus = require('http-status')

module.exports = function DeviceError (id, state, status = httpStatus.INTERNAL_SERVER_ERROR) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.status = status
  this.state = state
  this.mqttTopic = null
  this.id = id
}

require('util').inherits(module.exports, Error)
