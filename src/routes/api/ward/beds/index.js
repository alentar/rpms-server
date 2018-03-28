'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })
const validator = require('express-validation')
const { create, update, bulkCreate } = require('../../../../validations/bed.validation')
const bedController = require('../../../../controllers/bed.controller')
const auth = require('../../../../middlewares/authorization')

router.post('/', auth(['admin']), validator(create), bedController.create)
router.post('/bulk', auth(['admin']), validator(bulkCreate), bedController.bulkCreate)
router.put('/:bedId', auth(['admin']), validator(update), bedController.update)
router.delete('/:bedId', auth(['admin']), bedController.delete)
router.get('/:bedId', auth(), bedController.view)

module.exports = router
