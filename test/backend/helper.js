import request from 'supertest'
import Promise from 'bluebird'
import backend from '../backend'
Promise.promisifyAll(request)

exports.clearDb = function () {
  return backend.redis.client.flushdb()
}

exports.redis = backend.redis.client
exports.repositories = backend.repositories

// Configure parsing for superagent
require('superagent').serialize[backend.webConfig.mimeType] = JSON.stringify
