'use strict'
const express = require('express')
const router = express.Router()
const authRouter = require('./auth')
const userRouter = require('./user')
const wardRouter = require('./ward')

/**
 *
 * @api {GET} /api/status Check status of API
 * @apiName Status
 * @apiGroup Status
 * @apiVersion  1.0.0
 * @apiPermission public
 *
 * @apiSuccess (200) {String} status Status description
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "status" : "ok"
 * }
 *
 */
router.get('/status', (req, res) => { res.send({status: 'OK'}) }) // api status

router.use('/auth', authRouter) // mount auth routes
router.use('/users', userRouter) // mount user routes
router.use('/wards', wardRouter) // mount ward routes

module.exports = router
