import backend from './backend'
import {rheactorjsExpressConfig} from '../src/config/express/express-config'
import express from 'express'

const config = backend.config
const webConfig = backend.webConfig
const redis = backend.redis.client
const repositories = backend.repositories
const emitter = backend.emitter

// HTTP API
const app = express()
app.set('env', 'test') // Suppress errors logged from express.js
rheactorjsExpressConfig(app, config, webConfig, repositories, emitter)
const port = config.get('port')
const host = config.get('host')
app.listen(port, host)
console.log('Web:', config.get('web_host') + webConfig.baseHref)
console.log('API:', config.get('api_host'))

export default {
  app,
  repositories,
  redis,
  config,
  webConfig,
  emitter
}
