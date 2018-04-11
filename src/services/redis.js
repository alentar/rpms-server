'use strict'

const config = require('../config')
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)

const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  db: 1
})

client.once('connect', () => {
  client.flushdb()
})
client.on('error', (err) => {
  console.log('Redis Error: ', err)
})

module.exports = client
