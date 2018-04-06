'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')
const redis = require('../services/redis')
const User = require('../models/user.model')

const auth = (socket, next) => {
  const handshake = socket.handshake
  const query = handshake.query

  try {
    // fetch token
    if (query.token === null || query.token === undefined) throw new Error('No authentication token found')

    const tokenData = query.token.split(' ')
    if (tokenData.length < 2) throw new Error('Invalid token')

    // try to decode or throw error
    const decoded = jwt.verify(tokenData[1], config.secret)
    findUser(socket, next, decoded.sub)
  } catch (error) {
    console.log(error)
    return next(error)
  }
}

const findUser = (socket, next, userID) => {
  // try to get user from redis
  redis.get(userID, (err, rep) => {
    // oops there was an error
    if (err) {
      console.log(err)
      throw err
    }

    // no result from redis cache, then find it from mongo
    if (!rep) {
      User.findById(userID).select('-password -contacts -notifications').exec((err, user) => {
        // there was an error in query
        if (err) {
          console.log(err)
          throw err
        }

        // user found
        if (user) {
          // cache user for 600 seconds and set user for this socket so we can use his details
          redis.set(userID, JSON.stringify(user), 'EX', 600)
          socket.user = user
          next()
        } else {
          // no user is missing opps
          throw new Error('User not found')
        }
      })
    } else {
      // we found user from redis
      socket.user = JSON.parse(rep)
      next()
    }
  })
}

module.exports = auth
