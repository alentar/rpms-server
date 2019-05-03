'use strict'

process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/index').app
const should = chai.should()

chai.use(chaiHttp)

describe('Devices', () => {
  it('It should give an id when new device connected', (done) => {
    chai
      .request(app)
      .post('/api/devices/auth/self')
      .send({mac: "mymac233248294"})
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.have.property("id")
        done()
      })
  })

  it('It should return unauthorized', (done) => {
    chai
      .request(app)
      .post('/api/devices/auth/self')
      .send({mac: "mymac233248294"})
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.have.property("state").equal("unauthorized")
        done()
      })
  })
})
