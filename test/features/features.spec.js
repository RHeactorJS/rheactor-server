/* global beforeAll */

import path from 'path'
import glob from 'glob'
import app from '../server'
import runner from '@rheactorjs/yadda-feature-runner'
import { InternalContext, RestClientContext, TimeContext } from '@rheactorjs/bdd-contexts'

const apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features'))

beforeAll(() => new Promise((resolve, reject) => {
  app.redis.flushdb((err, succeeded) => {
    if (err) return reject(err)
    if (!succeeded) return reject(new Error('Failed to flush db.'))
    return resolve()
  })
}))

runner(app).run(glob.sync(apiFeaturesDir + '/*.feature'), [InternalContext, RestClientContext, TimeContext])
