'use strict'

const redis = require('../services/redis')

class Socket {
  async sendMessageToUser (event, payload, userId) {
    try {
      const clients = await redis.smembersAsync(`sio${userId}`)
      clients.forEach(client => {
        global.io.sockets.to(client).emit(event, payload)
      })

      return Promise.resolve()
    } catch (error) {
      console.log('Socket error', error)
    }
  }

  async announceToChannel (channel, event, payload) {
    try {
      global.io.sockets.to(channel).emit(event, payload)
    } catch (error) {
      console.log('Socket error', error)
    }
  }
}

const socketHelper = new Socket()
module.exports = socketHelper
