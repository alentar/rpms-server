'use strict'

const Patient = require('../models/patient.model')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const ObjectId = require('mongoose').Types.ObjectId

exports.admit = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.body.bed)) throw new APIError('Invalid bed', httpStatus.INTERNAL_SERVER_ERROR)

    const record = req.body
    record.admittedBy = req.user._id

    // we need more validation logic, but i laeve it here

    const newRecord = new Patient(record)
    const saved = await newRecord.save()

    res.status(httpStatus.CREATED)
    return res.json({patient: saved})
  } catch (error) {
    return next(Patient.checkDuplicateNicError(error))
  }
}

exports.discharge = async (req, res, next) => {
  try {

  } catch (error) {

  }
}
