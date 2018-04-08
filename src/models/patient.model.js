'use strict'

const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema({
  bht: {
    type: String,
    required: true,
    index: true
  },


})
