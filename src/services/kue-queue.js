'use strict'

const queue = require('./kue')

// required models
const User = require('../models/user.model')

// process our jobs in queue
queue.process('bulk_notifications', 2, (job, done) => {
  User.sendBulkNotifications(job.data.critaria, job.data.payload)
    .then(() => {
      done()
    })
})
