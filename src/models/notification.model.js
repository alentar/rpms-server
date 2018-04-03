'use strict'

const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'general'
  },

  title: {
    type: String
  },

  content: {
    type: String
  },

  action: {
    type: String,
    default: ''
  },

  thumbnail: {
    type: String,
    default: ''
  }
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification
