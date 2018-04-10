'use strict'

const Joi = require('joi')

module.exports = {
  create: {
    body: {
      number: Joi.number().positive().required()
    }
  },

  update: {
    body: {
      number: Joi.number().optional().positive()
    }
  },

  bulkCreate: {
    body: {
      start: Joi.number().positive().min(1).required(),
      end: Joi.number().positive().min(Joi.ref('start')).required()
    }
  }
}
