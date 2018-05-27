'use strict'

const express = require('express')
const router = express.Router()
const patientController = require('../../../controllers/patient.controller')
const auth = require('../../../middlewares/authorization')
const { admit } = require('../../../validations/patient.validation')
const validator = require('express-validation')

// admit a patient
router.post('', auth(), validator(admit), patientController.admit)

// discharge a patient
router.delete('/discharge/:patient', auth(), patientController.discharge)

// delete a patient
router.delete('/:patient', auth(), patientController.delete)

// view records of a patient
router.get('/:patient/records', auth(), patientController.records)

// view a patient
router.get('/:patient', auth(), patientController.view)

// index patient
router.get('', auth(), patientController.index)

// update patient
router.put('/:patient', auth(), patientController.update)

module.exports = router
