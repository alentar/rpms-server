'use strict'

const Joi = require('joi')

module.exports = {
  create: {
    body: {
      name: Joi.string().max(100).optional(),
      number: Joi.number().required().min(1)
    }
  },

  update: {
    body: {
      name: Joi.string().max(100).optional(),
      number: Joi.number().optional().positive()
    }
  }
}
