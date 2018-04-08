'use strict'

const mongoose = require('mongoose')

const bedSchema = new mongoose.Schema({
  number: {
    type: Number,
    index: true,
    required: true,
    sparse: true
  },

  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }
}, {
  timestamps: true
})

const Bed = mongoose.model('Bed', bedSchema)
module.exports.Bed = Bed
module.exports.BedSchema = bedSchema
