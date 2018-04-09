'use strict'

const express = require('express')
const router = express.Router()
const patientController = require('../../../controllers/patient.controller')
const auth = require('../../../middlewares/authorization')
const { admit } = require('../../../validations/patient.validation')
const validator = require('express-validation')

router.post('', auth(), validator(admit), patientController.admit)

module.exports = router
