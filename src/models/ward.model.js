'use strict'

const mongoose = require('mongoose')
const BedSchema = require('./bed.model').BedSchema
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')

const wardSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 100
  },

  number: {
    type: Number,
    required: true,
    unique: true,
    index: true,
    sparse: true
  },

  beds: [
    BedSchema
  ]
}, {
  timestamps: true
})

wardSchema.statics = {
  checkDuplicateWardError (err) {
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
  },

  async list ({page = 1, perPage = 30}) {
    page = Number(page)
    perPage = Number(perPage)

    if (!page || page <= 0) throw new APIError('Invalid page')
    if (!perPage || (perPage <= 0 && perPage !== -1)) throw new APIError('Invalid perPage')

    let results = null
    if (perPage === -1) {
      results = await Ward.find().sort({'createdAt': -1})
    } else {
      results = await Ward.find()
        .limit(perPage)
        .skip(perPage * (page - 1))
        .sort({'createdAt': -1})
    }

    const wards = results
    const total = await Ward.count()
    const pages = Math.ceil(total / perPage)

    return {wards, pages, page, perPage, total}
  }
}

const Ward = mongoose.model('Ward', wardSchema)
module.exports = Ward
