'use strict'

const Joi = require('joi')

module.exports = {
  create: {
    body: {
      number: Joi.number().positive().required(),
      deviceId: Joi.string().optional()
    }
  },

  update: {
    body: {
      number: Joi.number().optional().positive(),
      deviceId: Joi.string().optional()
    }
  }
}
