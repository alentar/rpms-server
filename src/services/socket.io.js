'use strict'

const socketAuth = require('../middlewares/socket-auth')

module.exports = (io) => {
  io.use(socketAuth)
  let connectedClients = 0

  io.sockets.on('connection', (socket) => {
    connectedClients++
    console.log(connectedClients)
    console.log(socket.user.id, 'connected')

    socket.on('disconnect', () => {
      connectedClients--
      console.log(connectedClients)
      console.log(`${socket.user.id} disconnected`)
    })
  })
}
