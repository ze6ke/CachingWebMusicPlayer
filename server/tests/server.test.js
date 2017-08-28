process.env.NODE_ENV = 'unittest'

const app = require('../server.js') //if I use import here, it is evaluated before NODE_ENV is set and logging will happen
import request from 'supertest'
/*global describe, it */

describe('server', function() {

  it('serves bundle.js', function(done) {
    request(app).get('/bundle.js')
      .expect('content-type', /javascript/)
      .expect(200, done)
  })

  it('serves index.html', function(done) {
    request(app).get('/index.html')
      .expect('Content-Type', /html/)
      .expect(200, done)
  })

  it('does not serve xxfs.xxfs', function (done) {
    request(app).get('/xxfs.xxfs')
      .expect(404, done)
  })


})
