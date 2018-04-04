'use strict'

const socketAuth = require('../middlewares/socket-auth')
const redis = require('./redis')

module.exports = (io) => {
  io.use(socketAuth)
  let connectedClients = 0

  io.sockets.on('connection', (socket) => {
    connectedClients++
    console.log(connectedClients)
    console.log(socket.user.id, 'connected')
    redis.set(`sio${socket.user.id}`, socket.id)

    socket.on('disconnect', () => {
      connectedClients--
      console.log(connectedClients)
      redis.del(`sio${socket.user.id}`)
      console.log(`${socket.user.id} disconnected`)
    })
  })
}
