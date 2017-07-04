/* global process */

import Promise from 'bluebird'
import {EntryAlreadyExistsError, EntryNotFoundError} from '@rheactorjs/errors'
import config from './config'
import emitter from '../src/services/emitter'
import {RedisConnection} from '../src/services/redis-connection'
import {UserRepository} from '../src/repository/user-repository'
import {rheactorjsCommandHandler} from '../src/config/command-handler'
import {rheactorjsEventHandler} from '../src/config/event-handler'
import keys from '../src/services/keys'
import { blue } from 'colors'

Promise.longStackTraces()

const webConfig = {
  baseHref: '/',
  mimeType: 'application/vnd.rheactorjs.core.v2+json'
}

// Event listening
emitter.on('error', (err) => {
  if (err instanceof EntryNotFoundError || err instanceof EntryAlreadyExistsError) {
    return
  }
  throw err
})

// Persistence
const redis = new RedisConnection()
redis.connect().then((client) => {
  client.on('error', function (err) {
    console.error(err)
  })
})
const repositories = {
  user: new UserRepository(redis.client)
}

keys(config, redis.client)

// Create a mock TemplateMailer
const templateMailer = {
  send: (cfg, template, to, name, data) => {
    if (process.env.environment === 'development') {
      console.log(blue(`📧 ${template} -> ${to}`))
      console.log(data)
    }
    return Promise.resolve()
  }
}

// Event handling
rheactorjsCommandHandler(repositories, emitter, config, webConfig, templateMailer)
rheactorjsEventHandler(repositories, emitter, config)

// Password strength
config.set('bcrypt_rounds', 1)

export default {
  repositories,
  config,
  webConfig,
  emitter,
  redis
}
