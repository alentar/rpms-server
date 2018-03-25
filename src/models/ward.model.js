'use strict'

const mongoose = require('mongoose')
const BedSchema = require('./bed.model').BedSchema
const httpStatus = require('http-status')

const wardSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 100
  },

  number: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },

  beds: [
    BedSchema
  ]
}, {
  timestamps: true
})

wardSchema.statics = {
  checkDuplicateWardeError (err) {
    if (err.code === 11000) {
      var error = new Error('Ward number already exists')
      error.errors = [{
        field: 'number',
        location: 'body',
        messages: ['Ward number already exists']
      }]
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  }
}

const Ward = mongoose.model('Ward', wardSchema)
module.exports = Ward
