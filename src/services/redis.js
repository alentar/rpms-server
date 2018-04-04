'use strict'

const config = require('../config')
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)

const client = redis.createClient(config.redis.port)

client.on('error', (err) => {
  console.log('Redis Error: ', err)
})

module.exports = client
