'use strict'

const express = require('express')
const router = express.Router()
const authController = require('../../controllers/auth.controller')
const validator = require('express-validation')
const { create } = require('../../validations/user.validation')
const auth = require('../../middlewares/authorization')

/**
 *
 * @api {POST} /auth/register Register a new User to application
 * @apiName apiName
 * @apiGroup Authentication
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} nic NIC of the user to be registred
 * @apiParam  {String} name Name of the User
 * @apiParam  {String="admin", "doctor", "nurse"} [role="nurse"] role Role of the user
 * @apiParam  {String} [password] password Password of user, auto generated if not present
 *
 * @apiSuccess (200) {String} id description
 *
 * @apiParamExample  {type} Request-Example:
 * {
 *     property : value
 * }
 *
 *
 * @apiSuccessExample {type} Success-Response:
 * {
 *     property : value
 * }
 *
 *
 */
router.post('/register', validator(create), authController.register) // validate and register

router.post('/login', authController.login) // login

router.post('/validate/token', auth(), authController.validate) // validate token

// Authentication example
router.get('/secret1', auth(), (req, res) => {
  // example route for auth
  res.json({ message: 'Anyone can access(only authorized)' })
})
router.get('/secret2', auth(['admin']), (req, res) => {
  // example route for auth
  res.json({ message: 'Only admin can access' })
})
router.get('/secret3', auth(['user']), (req, res) => {
  // example route for auth
  res.json({ message: 'Only user can access' })
})

module.exports = router
