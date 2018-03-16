'use strict'

const User = require('../models/user.model')
const RefreshToken = require('../models/refreshToken.model')
const config = require('../config')
const httpStatus = require('http-status')
const moment = require('moment')
const APIError = require('../utils/APIError')

exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body)
    const token = await generateTokenResponse(user, accessToken)

    return res.json({
      user: user.transform(),
      token
    })
  } catch (error) {
    next(error)
  }
}

exports.refesh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const refreshObject = await RefreshToken.findOne({token: refreshToken})

    if (!refreshObject) throw new APIError('Invalid refresh token', httpStatus.UNAUTHORIZED)

    const { user, accessToken } = await User.findAndGenerateToken({refreshObject})
    const token = await generateTokenResponse(user, accessToken)

    return res.json({
      token
    })
  } catch (error) {
    next(error)
  }
}

async function generateTokenResponse (user, accessToken) {
  const tokenType = 'Bearer'
  const refreshObject = await RefreshToken.generate(user)
  const refreshToken = refreshObject.token
  const expiresIn = moment().add(config.tokenExpiration, 'hours')
  return {
    tokenType, accessToken, refreshToken, expiresIn
  }
}
