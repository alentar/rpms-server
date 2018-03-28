'use strict'

const httpStatus = require('http-status')
const DeviceError = require('../utils/DeviceError')

// hanlde not found error
exports.handleNotFound = (req, res, next) => {
  res.status(httpStatus.NOT_FOUND)
  res.json({
    'message': 'Requested resource not found'
  })
  res.end()
}

// handle errors
exports.handleError = (err, req, res, next) => {
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR)
  res.json({
    message: err.message,
    extra: err.extra,
    errors: err
  })
  res.end()
}

exports.handleDeviceError = (err, req, res, next) => {
  if (!(err instanceof DeviceError)) return next(err)

  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR)
  res.json({
    message: err.message,
    state: err.state
  })
  res.end()
}
