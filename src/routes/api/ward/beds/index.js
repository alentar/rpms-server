'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })
const validator = require('express-validation')
const bedValidation = require('../../../../validations/bed.validation')
const bedController = require('../../../../controllers/bed.controller')
const auth = require('../../../../middlewares/authorization')

router.post('/', auth(['admin']), validator(bedValidation.create), bedController.create)
router.put('/:bedId', auth(['admin']), validator(bedValidation.update), bedController.update)
router.delete('/:bedId', auth(['admin']), bedController.delete)
router.get('/:bedId', auth(), bedController.view)

module.exports = router
