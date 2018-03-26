'use strict'

const express = require('express')
const router = express.Router()
const validator = require('express-validation')
const wardValidation = require('../../../validations/ward.validation')
// const bedValidation = require('../../validations/beds.validation')
const wardController = require('../../../controllers/ward.controller')
// const bedController = require('../../controllers/beds.controller')
const auth = require('../../../middlewares/authorization')
const bedRoute = require('./beds')

router.use('/:wardId/beds', bedRoute)

router.post('/', auth(['admin']), validator(wardValidation.create), wardController.create)
router.delete('/:wardId', auth(['admin']), wardController.delete)
router.get('/:wardId', auth(), wardController.view)
router.get('/', auth(), wardController.index)
router.put('/:wardId', auth(['admin']), validator(wardValidation.update), wardController.update)

// router.post('/:wardId/beds', auth(['admin']), validator(bedValidation.create), bedController.create)
// router.put('/:wardId/beds/:bedId', auth(['admin']), validator(bedValidation.update), bedController.update)
// router.delete('/:wardId/beds/:bedId', auth(['admin']), bedController.delete)
// router.get('/:wardId/beds/:bedId', auth(), bedController.view)

module.exports = router
