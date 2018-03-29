'use strict'
const httpStatus = require('http-status')

module.exports = function DeviceError (message, state, status = httpStatus.INTERNAL_SERVER_ERROR) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
  this.status = status
  this.state = state
}

require('util').inherits(module.exports, Error)
