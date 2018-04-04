'use strict'

const socketAuth = require('../middlewares/socket-auth')

module.exports = (io) => {
  io.use(socketAuth)

  io.sockets.on('connection', (socket) => {
    console.log(socket.id, 'connected')

    socket.join('admin')
    io.to('admin').emit('joined', `${socket.user.sub}`)

    io.emit('glob', 'global event')

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}
