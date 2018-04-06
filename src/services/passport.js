'use strict'

const config = require('../config')
const User = require('../models/user.model')
const passportJWT = require('passport-jwt')
const redis = require('./redis')

const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
  secretOrKey: config.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtStrategy = new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  // get from redis or find
  redis.get(jwtPayload.sub, (err, rep) => {
    if (err) {
      console.log(err)
      return done(err)
    }

    if (!rep) {
      User.findById(jwtPayload.sub).select('-password -contacts -notifications').exec((err, user) => {
        if (err) {
          return done(err, null)
        }

        if (user) {
          redis.set(jwtPayload.sub, JSON.stringify(user), 'EX', 600)
          return done(null, user)
        } else {
          return done(null, false)
        }
      })
    } else {
      return done(null, JSON.parse(rep))
    }
  })
})

exports.jwtOptions = jwtOptions
exports.jwt = jwtStrategy
