'use strict'

const config = require('../config')
const mqtt = require('mqtt')
const client = mqtt.connect(`${config.mqtt.host}:${config.mqtt.port}`, { host: config.mqtt.host, port: config.mqtt.port, username: 'RPMS_SERVER', password: 'none' })

client.on('connect', () => {
  console.log('MQTT client initialized')
  client.subscribe('wards/+/patient/#')
  client.subscribe('devices')
})

client.on('disconnect', () => {
  console.log('MQTT client disconnected from broker')
})

client.on('reconnect', () => {
  console.log('Trying to reach broker')
})

client.on('error', function (error) {
  console.log('ERROR: ', error)
})

client.on('message', (topic, payload, packet) => {
  console.log(topic + ': ' + payload.toString())

  if (topic.includes('wards') && topic.includes('patient')) {
    const props = {}
    packet.topic.split('/').forEach((elem, i, arr) => {
      if (i % 2 === 0) props[elem] = arr[i + 1] ? arr[i + 1] : null
    })

    const data = {
      type: props.type,
      value: payload.toString()
    }

    global.io.to(`wards/${props.wards}`).emit(`patient${props.patient}`, data)
  }
})

module.exports = client
