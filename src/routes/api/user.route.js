'use strict'

const express = require('express')
const router = express.Router()
const validator = require('express-validation')
const { create, update } = require('../../validations/user.validation')
const userController = require('../../controllers/user.controller')
const auth = require('../../middlewares/authorization')

router.get('/', auth(), userController.index)
router.post('/', auth(['admin']), validator(create), userController.create)
router.get('/:userID', auth(), userController.view)
router.delete('/:userID', auth(['admin']), userController.delete)
router.put('/:userID', auth(), validator(update), userController.update)

module.exports = router
