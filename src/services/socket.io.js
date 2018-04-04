'use strict'

const socketAuth = require('../middlewares/socket-auth')

module.exports = (io) => {
  io.use(socketAuth)

  io.sockets.on('connection', (socket) => {
    console.log(socket.user.sub, 'connected')

    socket.join('admin')
    io.to('admin').emit('joined', `${socket.user.sub}`)

    socket.on('disconnect', () => {
      console.log(`${socket.user.sub} disconnected`)
    })
  })
}
