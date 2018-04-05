'use strict'

const socketAuth = require('../middlewares/socket-auth')
const redis = require('./redis')

module.exports = (io) => {
  io.use(socketAuth)
  let connectedClients = 0

  io.sockets.on('connection', async (socket) => {
    try {
      const hasClients = await redis.smembersAsync(`sio${socket.user.id}`)
      if (hasClients.length === 0) ++connectedClients
      io.sockets.emit('userCount', connectedClients)
      await redis.saddAsync(`sio${socket.user.id}`, [socket.id])
    } catch (error) {
      console.error(error)
    }

    socket.on('disconnect', async () => {
      try {
        await redis.sremAsync(`sio${socket.user.id}`, socket.id)
        const clients = await redis.existsAsync(`sio${socket.user.id}`)
        console.log('cl', clients)
        if (clients === 0) {
          --connectedClients
          console.log('no clients for this')
        }
        io.sockets.emit('userCount', connectedClients)
        console.log(`${socket.user.id} disconnected from ${socket.id}`)
      } catch (error) {
        console.log(error)
      }
    })
  })
}
