/* global process */

import nconf from 'nconf'
import path from 'path'

nconf.use('memory')

const host = '127.0.0.1'
const port = 8080
const environment = process.env.environment || 'development'

// Set defaults
nconf.defaults({
  environment,
  'version': '0.0.0',
  'mime_type': 'application/vnd.rheactorjs.core.v2+json',
  'port': port,
  'host': host,
  'api_host': 'http://' + host + ':' + port,
  'web_host': 'http://' + host + ':8081',
  'base_href': '/',
  'deploy_time': +new Date(),
  'app': process.env.npm_package_name,
  'root': path.normalize(path.join(__dirname, '/../..')),
  'token_lifetime': 1800,
  'activation_token_lifetime': 60 * 60 * 24 * 30,
  'redis': {
    'host': '127.0.0.1',
    'port': 6379,
    'database': 0,
    'password': null
  },
  'private_key': null,
  'public_key': null,
  'bcrypt_rounds': 14,
  'template_mailer': {
    'transport': 'server',
    'template_prefix': 'server-',
    'password_change_template': 'password-change',
    'email_verification_template': 'email-verification',
    'email_change_template': 'email-change'
  },
  'trustedAvatarURL': environment === 'testing' ? '^https://example.com/.+' : '^https?://.+'
})

export default nconf
