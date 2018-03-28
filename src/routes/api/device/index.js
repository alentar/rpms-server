'use strict'

const express = require('express')
const router = express.Router()
const validator = require('express-validation')
const deviceController = require('../../../controllers/device.controller')
const { selfAuthenticate, update } = require('../../../validations/device.validation')
const auth = require('../../../middlewares/authorization')

router.post('/auth/self', validator(selfAuthenticate), deviceController.selfAuthenticate)

router.get('/:deviceId', auth(['admin']), deviceController.view)
router.get('', auth(['admin']), deviceController.index)
router.delete('/:deviceId', auth(['admin']), deviceController.delete)
router.put('/:deviceId', auth(['admin']), validator(update), deviceController.update)

router.post('/:deviceId/blacklist', auth(['admin']), deviceController.blacklist)
router.post('/:deviceId/whitelist', auth(['admin']), deviceController.whitelist)
router.post('/:deviceId/authorize', auth(['admin']), deviceController.authorize)
router.post('/:deviceId/unauthorize', auth(['admin']), deviceController.unauthorize)
router.post('/:deviceId/assign', auth(['admin']), deviceController.assign)
router.post('/:deviceId/unassign', auth(['admin']), deviceController.unassign)

module.exports = router