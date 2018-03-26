'use strict'

const Joi = require('joi')

module.exports = {
  create: {
    body: {
      bed: {
        number: Joi.number().positive(),
        deviceId: Joi.string().optional()
      }
    }
  },

  update: {
    body: {
      bed: {
        number: Joi.number().optional().positive(),
        deviceId: Joi.string().optional()
      }
    }
  }
}
