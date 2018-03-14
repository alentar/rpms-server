'use strict'

const express = require('express')
const router = express.Router()
const authController = require('../../controllers/auth.controller')

/**
 * @api {post} /api/auth/login Login
 * @apiName Login
 * @apiGroup Authentication
 * @apiVersion  1.0.0
 * @apiPermission public
 *
 * @apiParam  {String} nic NIC of the user
 * @apiParam  {String} password Password of user
 *
 * @apiSuccess (200) {Object} user A user object
 * @apiSuccess (200) {Object} token Token object
 * @apiSuccess (200) {String} token.tokenType Type of the token
 * @apiSuccess (200) {String} token.accessToken Access Token for user. This is short lived
 * @apiSuccess (200) {String} token.refreshToken Refresh Token for user. This is long lived
 * @apiSuccess (200) {String} token.expiresIn Access Token expiration time
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *     "nic" : "123456789v"
 *     "password": "yourpassword"
 * }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *  "user": {
 *      "id": "5aa2242abec1cc0578946ef0",
 *      "name": {
 *          "first": "Jhon",
 *          "last": "Doe"
 *      },
 *      "nic": "111111111v",
 *      "createdAt": "2018-03-09T06:05:30.387Z",
 *      "role": "admin",
 *      "registerID": "1111cvg",
 *      "contacts": []
 *  },
 *  "token": {
 *      "tokenType": "Bearer",
 *      "accessToken": "<access-token>",
 *      "refreshToken": "<refresh-token>",
 *      "expiresIn": "2018-03-14T16:58:19.089Z"
 *  }
 * }
 *
 * @apiError {404} UserNotFound No user found for given credentials

 * @apiErrorExample {json} UserNotFound:
 *    {
 *      "message": "No user associated with thisid",
 *      "extra": null,
 *      "errors": {
 *          "name": "APIError",
 *          "message": "No user associated with thisid",
 *          "status": 404,
 *          "extra": null
 *      }
 *    }
 * @apiError {401} PasswordMismatch Password is not correct
 * @apiErrorExample {json} PasswordMismatch:
 *    {
 *      "message": "Password mismatch",
 *      "extra": null,
 *      "errors": {
 *          "name": "APIError",
 *          "message": "Password mismatch",
 *          "status": 401,
 *          "extra": null
 *      }
 *    }
 */
router.post('/login', authController.login)

/**
 * @api {post} /api/auth/refresh/token Refresh Token
 * @apiName RefreshToken
 * @apiGroup Authentication
 * @apiVersion  1.0.0
 * @apiPermission public
 *
 * @apiParam  {String} refrshToken A Refreh token
 *
 * @apiSuccess (200) {Object} token Token object
 * @apiSuccess (200) {String} token.tokenType Type of the token
 * @apiSuccess (200) {String} token.accessToken Access Token for user. This is short lived
 * @apiSuccess (200) {String} token.refreshToken Refresh Token for user. This is long lived
 * @apiSuccess (200) {String} token.expiresIn Access Token expiration time
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *     "refrshToken" : "<your-token>"
 * }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "token": {
 *      "tokenType": "Bearer",
 *      "accessToken": "<access-token>",
 *      "refreshToken": "<refresh-token>",
 *      "expiresIn": "2018-03-14T16:58:19.089Z"
 *    }
 * }
 *
 * @apiError {401} TokenError Invalid Token was given
 *
 * @apiErrorExample {json} UserNotFound:
 *    {
 *      "message": "Invalid refresh token",
 *      "extra": null,
 *      "errors": {
 *          "name": "APIError",
 *          "message": "Invalid refresh token",
 *          "status": 401,
 *          "extra": null
 *      }
 *    }
 */
router.post('/refresh/token', authController.refesh)

module.exports = router
