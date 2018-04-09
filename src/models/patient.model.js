'use strict'

const mongoose = require('mongoose')
const httpStatus = require('http-status')

const patientSchema = new mongoose.Schema({
  bht: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  nic: {
    type: String,
    default: ''
  },

  admittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  admittedAt: {
    type: Date,
    default: Date.now()
  },

  discharged: {
    type: Boolean,
    default: false
  },

  dischargedAt: {
    type: Date,
    default: ''
  },

  dischargedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  telephones: [{
    type: String,
    default: ''
  }],

  dob: {
    type: Date,
    default: ''
  },

  age: {
    type: String,
    required: true
  },

  nationality: {
    type: String,
    default: 'Sinhala'
  },

  religion: {
    type: String,
    default: 'Buddhist'
  },

  occupation: {
    type: String,
    default: ''
  },

  martialStatus: {
    type: String,
    default: 'Single'
  },

  sex: {
    type: String,
    default: 'male'
  },

  clinicalNotes: {
    type: String,
    default: ''
  },

  examination: {
    type: String,
    default: ''
  },

  invistigation: {
    type: String,
    default: ''
  },

  treatment: {
    type: String,
    default: ''
  },

  reason: {
    type: String,
    default: ''
  },

  typeOfAdmission: {
    type: String,
    default: ''
  },

  extra: {
    type: String,
    default: ''
  },

  records: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientRecord'
    }
  ]
}, {
  timestamps: true
})

patientSchema.statics = {
  checkDuplicateNicError (err) {
    if (err.code === 11000) {
      var error = new Error('BHT already taken')
      error.errors = [{
        field: 'bht',
        location: 'body',
        messages: ['BHT already taken']
      }]
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  }
}

const Patient = mongoose.model('Patient', patientSchema)
module.exports = Patient
