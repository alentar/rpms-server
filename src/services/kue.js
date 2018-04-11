'use strict'

const kue = require('kue')
const config = require('../config')
const queue = kue.createQueue({
  jobEvents: false,
  redis: {
    host: config.redis.host,
    port: config.redis.port
  }
})

module.exports = queue
