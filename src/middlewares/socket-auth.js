'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')
const redis = require('../services/redis')
const User = require('../models/user.model')

const auth = (socket, next) => {
  const handshake = socket.handshake
  const query = handshake.query

  try {
    if (query.token === null || query.token === undefined) throw new Error('No authentication token found')
    console.log(query.token)
    const tokenData = query.token.split(' ')

    if (tokenData.length < 2) throw new Error('Invalid token')
    const decoded = jwt.verify(tokenData[1], config.secret)
    findUser(socket, next, decoded.sub)
  } catch (error) {
    console.log(error)
    return next(error)
  }
}

const findUser = (socket, next, userID) => {
  redis.get(userID, (err, rep) => {
    console.log(userID)
    if (err) {
      console.log(err)
      throw err
    }

    if (!rep) {
      User.findById(userID, (err, user) => {
        if (err) {
          console.log(err)
          throw err
        }

        if (user) {
          const transformed = user.transform()
          redis.set(userID, JSON.stringify(transformed))
          socket.user = transformed
          next()
        } else {
          throw new Error('User not authorized')
        }
      })
    } else {
      socket.user = JSON.parse(rep)
      next()
    }
  })
}

module.exports = auth
