'use strict'

const Joi = require('joi')
const User = require('../models/user.model')
const roles = User.roles
const titles = User.titles
const genders = User.genders

// User validation rules
module.exports = {
  create: {
    body: {
      nic: Joi.string().min(9).max(12).required(),
      password: Joi.string().min(6).max(128).optional(),
      name: Joi.object({
        first: Joi.string().required(),
        last: Joi.string().required()
      }),
      registerID: Joi.string().optional(),
      role: Joi.string().valid(roles).optional(),
      contacts: Joi.array().items(Joi.string().min(10).max(13)).optional(),
      gender: Joi.string().valid(genders).required(),
      title: Joi.string().valid(titles).required()
    }
  },

  update: {
    body: {
      nic: Joi.string().min(9).max(12).optional(),
      password: Joi.string().min(6).max(128).optional(),
      name: Joi.object({
        first: Joi.string().optional(),
        last: Joi.string().optional()
      }),
      registerID: Joi.string().optional(),
      role: Joi.string().valid(roles).optional(),
      contacts: Joi.array().items(Joi.string().min(10).max(13)).optional(),
      gender: Joi.string().valid(genders).optional(),
      title: Joi.string().valid(titles).optional()
    }
  }
}
