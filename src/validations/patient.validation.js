'use strict'

const Joi = require('joi')

// User validation rules
module.exports = {
  admit: {
    body: {
      bht: Joi.string().min(7).required(),
      name: Joi.string().max(150).required(),
      age: Joi.number().positive().required(),
      telephones: Joi.array().items(Joi.string().min(10).max(13)).optional()
    }
  }
}
