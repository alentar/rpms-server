'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')

const auth = (socket, next) => {
  const handshake = socket.handshake
  const query = handshake.query

  if (!query.token) next(new Error('No authentication token found'))

  try {
    const tokenData = query.token.split(' ')
    if (tokenData.length < 2) throw new Error('Invalid token')
    const decoded = jwt.verify(tokenData[1], config.secret)
    socket.user = decoded
    next()
  } catch (error) {
    console.log(error)
    next(error)
  }
}

module.exports = auth
