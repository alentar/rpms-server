'use strict'

const Joi = require('joi')

module.exports = {
  selfAuthenticate: {
    body: {
      name: Joi.string().optional(),
      mac: Joi.string().required(),
      chipID: Joi.string().optional()
    }
  },

  update: {
    body: {
      name: Joi.string().optional()
    }
  }
}
