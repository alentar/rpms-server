'use strict'

const kue = require('kue')
const queue = kue.createQueue({
  jobEvents: false
})

module.exports = queue
