'use strict'
const express = require('express')
const router = express.Router()
const authRouter = require('./auth.route')

/**
 *
 * @api {GET} /api/status Check status of API
 * @apiName apiName
 * @apiGroup Status
 * @apiVersion  1.0.0
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

router.use('/auth', authRouter) // mount auth paths

module.exports = router
