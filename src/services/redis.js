'use strict'

const config = require('../config')
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient)

const client = redis.createClient(config.redis.port)

module.exports = client
