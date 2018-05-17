'use strict'

const mongoose = require('mongoose')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')

const recordSchema = new mongoose.Schema({
  value: {
    type: Number
  }
}, { timestamps: true })

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
    default: null
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
    default: null
  },

  age: {
    type: String,
    required: true
  },

  nationality: {
    type: String,
    default: ''
  },

  religion: {
    type: String,
    default: ''
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

  records: {
    temperature: [recordSchema],
    bpm: [recordSchema]
  },

  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward'
  },

  bed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed'
  }
}, {
  timestamps: true
})

patientSchema.statics = {
  checkDuplicateBHTError (err) {
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
  },

  async list ({ page = 1, perPage = 30, sortBy = 'createdAt', order = 'desc' }) {
    page = Number(page)
    perPage = Number(perPage)

    if (!page || page <= 0) throw new APIError('Invalid page')
    if (!perPage || (perPage <= 0 && perPage !== -1)) throw new APIError('Invalid perPage')
    order = (order === 'asc' ? 1 : -1)

    const fields = ['name', 'nic', 'createdAt', 'bht']
    sortBy = !fields.includes(sortBy) ? 'createdAt' : sortBy
    const sorter = {}
    sorter[sortBy] = order

    const find = {}

    let results = null
    if (perPage === -1) {
      results = await Patient.find(find)
        .populate('dischargedBy', 'nic name')
        .populate('admittedBy', 'nic name')
        .populate('ward', 'number name')
        .select('-records -telephones')
        .sort(sorter)

      perPage = 1
    } else {
      results = await Patient.find(find)
        .populate('dischargedBy', 'nic name')
        .populate('admittedBy', 'nic name')
        .populate('ward', 'number name')
        .select('-records -telephones')
        .limit(perPage)
        .skip(perPage * (page - 1))
        .sort(sorter)
    }

    const total = await Patient.find(find).count()
    const pages = Math.ceil(total / perPage)

    return {patients: results, pages, page, perPage, total}
  }
}

const Patient = mongoose.model('Patient', patientSchema)
module.exports = Patient
