const mongoose = require('mongoose')
const crypto = require('crypto')
const moment = require('moment-timezone')

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userNIC: {
    type: 'String',
    ref: 'User',
    required: true
  },
  expires: { type: Date }
})

refreshTokenSchema.statics = {

  async generate (user) {
    const userId = user._id
    const userNIC = user.nic

    // check if user already has a issued token
    const prevToken = await RefreshToken.findOne({userId: userId, userNIC: userNIC})
    if (prevToken !== null) {
      if (moment().isBefore(prevToken.expires)) return prevToken
      else await RefreshToken.findByIdAndRemove(prevToken._id)
    }

    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`
    const expires = moment().add(5, 'years').toDate()

    const tokenObject = new RefreshToken({
      token, userId, userNIC, expires
    })
    tokenObject.save()
    return tokenObject
  }

}

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)
module.exports = RefreshToken
