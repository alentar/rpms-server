'use strict'

const express = require('express')
const router = express.Router()
const validator = require('express-validation')
const { create } = require('../../validations/ward.validation')
const wardController = require('../../controllers/ward.controller')
const auth = require('../../middlewares/authorization')

router.post('', auth(['admin']), validator(create), wardController.create)
router.delete('/:wardId', auth(['admin']), wardController.delete)
router.post('/:wardId', auth(['admin']))

module.exports = router
