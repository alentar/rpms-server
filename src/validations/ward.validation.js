'use strict'

const Joi = require('joi')

module.exports = {
  create: {
    body: {
      name: Joi.string().max(100).optional(),
      number: Joi.number().required().positive(),
      beds: Joi.array().unique((a, b) => { return a.number === b.number }).items(Joi.object().keys({
        number: Joi.number(),
        deviceID: Joi.string().optional()
      })).optional()
    }
  }
}
