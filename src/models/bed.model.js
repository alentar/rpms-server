'use strict'

const mongoose = require('mongoose')

const bedSchema = new mongoose.Schema({
  number: {
    type: Number,
    index: true,
    required: true,
    sparse: true
  },

  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    default: null
  },

  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  }
}, {
  timestamps: true
})

const Bed = mongoose.model('Bed', bedSchema)
module.exports.Bed = Bed
module.exports.BedSchema = bedSchema
