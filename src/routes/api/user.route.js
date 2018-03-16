'use strict'

const express = require('express')
const router = express.Router()
const validator = require('express-validation')
const { create, update } = require('../../validations/user.validation')
const userController = require('../../controllers/user.controller')
const auth = require('../../middlewares/authorization')

/**
 *
 * @api {get} /api/users Index all users
 * @apiName Index
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission authorized
 *
 * @apiParam  {Number} [page]         Page need to be shown
 * @apiParam  {Number} [perPage]      Items per page
 *
 * @apiSuccess (200) {Array}  users   Array of users
 * @apiSuccess (200) {Number} page    Current page
 * @apiSuccess (200) {Number} perPage Items per page
 * @apiSuccess (200) {Number} pages   Total number of pages
 * @apiSuccess (200) {Number} total   Total number of users
 *
 * @apiParamExample  {curl} Request-Example:
 *  curl -H "Authorization: Bearer <access-token>" http://<host>:<port>/api/users?page=1&perPage=30
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "users": [
 *        {
 *            "id": "5aa8ea54e8f7a98fe8c15df3",
 *            "name": {
 *                "first": "Jhon",
 *                "last": "Doe"
 *            },
 *            "nic": "123456789v",
 *            "createdAt": "2018-03-14T09:24:36.463Z",
 *            "role": "admin",
 *            "registerID": "someid",
 *            "contacts": []
 *        },
 *        ...
 *    ],
 *    "pages": 1,
 *    "page": 1,
 *    "perPage": 30,
 *    "total": 7
 *  }
 *
 * @apiError {500} InvalidPage      Invalid Page number was given
 * @apiError {500} InvalidPerPage   Invalid Per Page number was given
 *
 * @apiErrorExample {InvalidPage} Error-Response:
 *   {
 *      "message": "Invalid page",
 *      "extra": null,
 *      "errors": {
 *          "name": "APIError",
 *          "message": "Invalid page",
 *          "status": 500,
 *          "extra": null
 *      }
 *    }
 *
 */
router.get('/', auth(), userController.index)

/**
 *
 * @api {post} /api/users Creates a new User
 * @apiName CreateUser
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission admin
 *
 *
 * @apiParam  {String{9..12}}                     nic             NIC of new user
 * @apiParam  {String{6..128}}                    [password=nic]  Password for new user, if not provided NIC will be used as password
 * @apiParam  {Object}                            name            Name of the user
 * @apiParam  {String}                            name.first      First name
 * @apiParam  {String}                            name.last       Last name
 * @apiParam  {String="admin", "nurse", "doctor"} [role="nurse"]  Role of the user
 * @apiParam  {String}                            [registerID]    Registeration ID for user if avaliable
 * @apiParam  {String[]}                          [contacts]      Contacts of user
 *
 * @apiSuccess (200) {String} id ID for newly created user
 *
 * @apiParamExample  {json} Request-Example:
 *  Authorization: Bearer <access-token>
 *  {
 *    "name": {
 *      "first": "Jhone",
 *      "last": "Doe"
 *    },
 *    "nic": "22234350279b",
 *    "registerID": "someawsomeID",
 *    "password": "mypassword",
 *    "contatcs": ["1234567890"],
 *    "role": "admin"
 *  }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "id" : "someid"
 * }
 *
 * @apiError {409} DuplicateNIC     NIC already taken
 * @apiError {500} ValidationErrors Validation errors thrown by validator
 *
 */
router.post('/', auth(['admin']), validator(create), userController.create)

/**
 *
 * @api {get} /api/users/me Get current user
 * @apiName GetCurrentUser
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission authorized
 *
 * @apiParamExample  {curl} Request-Example:
 *    curl -H "Authorization: Bearer <access-token>" http://<host>:<port>/api/users/me
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
  *   "user" :{
  *     "name": {
  *       "first": "Jhone",
  *       "last": "Doe"
  *     },
  *     "nic": "22234350279b",
  *     "registerID": "someawsomeID",
  *     "password": "mypassword",
  *     "contatcs": ["1234567890"],
  *     "role": "admin"
  *    }
  * }
 *
 */
router.get('/me', auth(), userController.me)

/**
 *
 * @api {get} /api/users/:id Get an user
 * @apiName GetUser
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission authorized
 *
 * @apiParam  {String} id                 Unique ID that represent the user
 *
 * @apiSuccess (200) {String} nic         NIC of new user
 * @apiSuccess (200) {String} password    Password for new user, if not provided NIC will be used as password
 * @apiSuccess (200) {Object} name        Name of the user
 * @apiSuccess (200) {String} name.first  First name
 * @apiSuccess (200) {String} name.last   Last name
 * @apiSuccess (200) {String} role        Role of the user
 * @apiSuccess (200) {String} registerID  Registeration ID for user if avaliable
 * @apiSuccess (200) {Array}  contacts    Contacts of user
 *
 * @apiParamExample  {curl} Request-Example:
 *  curl -H "Authorization: Bearer <access-token>" http://<host>:<port>/api/users/someuniqueid
 *
 * @apiSuccessExample {json} Success-Response:
*  {
  *   "user" :{
  *     "name": {
  *       "first": "Jhone",
  *       "last": "Doe"
  *     },
  *     "nic": "22234350279b",
  *     "registerID": "someawsomeID",
  *     "password": "mypassword",
  *     "contatcs": ["1234567890"],
  *     "role": "admin"
  *    }
  * }
 *
 * @apiError {404} NotFound     Requested user not found
 * @apiError {500} InvalidID    ID is invalid
 */
router.get('/:userID', auth(), userController.view)

/**
 *
 * @api {delete} /api/users/:id Deletes an user
 * @apiName DeleteUser
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission admin
 *
 *
 * @apiParam  {String} id An unique ID which represents the user to be deleted
 *
 * @apiSuccess (200) {Boolean} success Was operation success
 *
 * @apiParamExample  {curl} Request-Example:
 *  curl -H "Authorization: Bearer <access-token>" -X DELETE http://<host>:<port>/api/users/someuniqueid
 *
 *
 * @apiSuccessExample {type} Success-Response:
 * {
 *     "success" : true
 * }
 *
 * @apiError {404} NotFound     Requested user not found
 * @apiError {500} InvalidID    ID is invalid
 */
router.delete('/:userID', auth(['admin']), userController.delete)

/**
 *
 * @api {put} /users/:id Updates a given user
 * @apiName PutUser
 * @apiGroup Users
 * @apiVersion  1.0.0
 * @apiPermission authorized
 *
 *
 * @apiParam  {String{9..12}}                     [nic]             NIC of new user
 * @apiParam  {String{6..128}}                    [password=nic]    Password for new user, if not provided NIC will be used as password
 * @apiParam  {Object}                            [name]            Name of the user
 * @apiParam  {String}                            [name.first]      First name
 * @apiParam  {String}                            [name.last]       Last name
 * @apiParam  {String="admin", "nurse", "doctor"} [role]            Role of the user, only admins can change this
 * @apiParam  {String}                            [registerID]      Registeration ID for user if avaliable
 * @apiParam  {String[]}                          [contacts]        Contacts of user
 *
 * @apiSuccess (200) {String} nic         NIC of new user
 * @apiSuccess (200) {String} password    Password for new user, if not provided NIC will be used as password
 * @apiSuccess (200) {Object} name        Name of the user
 * @apiSuccess (200) {String} name.first  First name
 * @apiSuccess (200) {String} name.last   Last name
 * @apiSuccess (200) {String} role        Role of the user
 * @apiSuccess (200) {String} registerID  Registeration ID for user if avaliable
 * @apiSuccess (200) {Array}  contacts    Contacts of user
 *
 * @apiParamExample  {json} Request-Example:
 *  Authorization: Bearer <access-token>
 *  {
 *    "name": {
 *      "first": "Jhone new",
 *    }
 *  }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "name": {
 *      "first": "Jhone new",
 *      "last": "Doe"
 *    },
 *    "nic": "22234350279b",
 *    "registerID": "someawsomeID",
 *    "password": "mypassword",
 *    "contatcs": ["1234567890"],
 *    "role": "admin"
 *  }
 *
 * @apiError {404} NotFound           Requested user not found
 * @apiError {500} InvalidID          ID is invalid
 * @apiError {500} ValidationError    Validation errors
 * @apiError {409} DuplicateNIC       Nic is already taken
 */
router.put('/:userID', auth(), validator(update), userController.update)

module.exports = router
