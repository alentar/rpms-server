'use strict'

const socketAuth = require('../middlewares/socket-auth')
const redis = require('./redis')

module.exports = (io) => {
  io.use(socketAuth)
  let connectedClients = 0

  io.sockets.on('connection', async (socket) => {
    try {
      const hasClients = await redis.existsAsync(`sio${socket.user._id}`)
      if (hasClients === 0) ++connectedClients
      io.sockets.emit('userCount', connectedClients)
      await redis.saddAsync(`sio${socket.user._id}`, [socket.id])

      // join user to room with its role
      socket.join(socket.user.role)
    } catch (error) {
      console.error(error)
    }

    socket.on('disconnect', async () => {
      try {
        await redis.sremAsync(`sio${socket.user._id}`, socket.id)
        const clients = await redis.existsAsync(`sio${socket.user._id}`)

        if (clients === 0) --connectedClients

        io.sockets.emit('userCount', connectedClients)
        console.log(`${socket.user._id} disconnected from ${socket.id}`)
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('join', (room) => {
      console.log('joined')
      socket.join(room)
    })

    socket.on('leave', (room) => {
      socket.leave(room)
    })
  })
}
