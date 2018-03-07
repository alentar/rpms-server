'use strict'

const Joi = require('joi')
const userRoles = require('../models/user.model').roles

// User validation rules
module.exports = {
  create: {
    body: {
      nic: Joi.string().min(9).max(12).required(),
      password: Joi.string().min(6).max(128).required(),
      name: Joi.object({
        first: Joi.string().required(),
        last: Joi.string().required()
      }),
      registerID: Joi.string().required(),
      role: Joi.string().valid(userRoles).optional(),
      contacts: Joi.array().items(Joi.string().min(10).max(13)).optional()
    }
  }
}
