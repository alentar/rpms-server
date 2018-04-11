'use strict'

const config = require('../config')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const errorHandler = require('../middlewares/error-handler')
const apiRouter = require('../routes/api')
const passport = require('passport')
const passportJwt = require('../services/passport')
const socketio = require('socket.io')
const path = require('path')
require('./kue-queue') // run all the jobs in queue

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())

if (config.env !== 'prod') app.use(morgan('combined'))

// passport
app.use(passport.initialize())
passport.use('jwt', passportJwt.jwt)

// serve static files
app.use('/public', express.static(path.join(__dirname, '../../public')))

app.use('/api', apiRouter)
app.use(errorHandler.handleNotFound)
app.use(errorHandler.handleDeviceError)
app.use(errorHandler.handleError)

exports.start = () => {
  const server = app.listen(config.port, config.host, (err) => {
    if (err) {
      console.log(`Error : ${err}`)
      process.exit(-1)
    }

    console.log(`${config.app} is running on http://${config.host}:${config.port}`)
  })

  global.io = socketio(server)
  require('./socket.io')(global.io)
}

exports.app = app
