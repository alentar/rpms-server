'use strict'

const mongoose = require('mongoose')

const patientRecordSchema = new mongoose.Schema({
  temperature: {
    type: Number
  },

  heartrate: {
    type: Number
  }
}, {
  timestamps: true
})

const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema)
module.exports = PatientRecord
