require('dotenv').config() // load .env file

module.exports = {
  port: process.env.PORT,
  host: process.env.HOST,
  app: process.env.APP,
  env: process.env.NODE_ENV,
  secret: process.env.APP_SECRET,
  tokenExpiration: process.env.TOKEN_EXPIRATION_HOURS,
  mongo: {
    uri: process.env.MONGOURI,
    testURI: process.env.MONGOTESTURI
  },
  redis: {
    host: process.env.REDISHOST,
    port: process.env.REDISPORT
  },
  mqtt: {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT
  }
}
