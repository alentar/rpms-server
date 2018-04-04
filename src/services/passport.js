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
  redis.get(jwtPayload.sub, (err, rep) => {
    console.log(jwtPayload.sub)
    if (err) {
      console.log(err)
      return done(err)
    }

    if (!rep) {
      User.findById(jwtPayload.sub, (err, user) => {
        if (err) {
          return done(err, null)
        }

        if (user) {
          const transformed = user.transform()
          redis.set(jwtPayload.sub, JSON.stringify(transformed))
          return done(null, transformed)
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
