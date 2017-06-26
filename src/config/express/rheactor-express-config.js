import passport from 'passport'
import {Strategy as BearerStrategy} from 'passport-http-bearer'
import tokenBearerStrategy from './token-bearer-strategy'
import JSONLD from '../jsonld'
import {verify} from '../../util/tokens'
import {transform} from '../../api/transformer'
import {rheactorjsExpressBaseConfig} from './base'
import {URIValue} from '@rheactorjs/value-objects'
import indexRoute from '../../api/route/index'
import statusRoute from '../../api/route/status'
import registrationRoute from '../../api/route/registration'
import {tokenRoutes} from '../../api/route/token'
import loginRoute from '../../api/route/login'
import passwordChangeRoute from '../../api/route/password-change'
import profileRoute from '../../api/route/profile'
import activateAccountRoute from '../../api/route/activate-account'
import userRoute from '../../api/route/user'

/**
 * This allows to have multiple handlers for different tokens
 *
 * Each parser can decide whether to handle the presented token,
 * if not it should call the provided next() method to let the next
 * parser have a go at the token.
 *
 * The last parser is always the default token parser from server.
 *
 * @param {Array.<function(String, function, function)>} tokenParsers
 * @returns {function(String, function)}
 */
const chainedTokenParsers = tokenParsers => {
  return (tokenString, cb) => {
    let idx = 0
    const next = () => {
      const parser = tokenParsers[idx++]
      if (!parser) return cb(null, false) // no more token parsers left
      return parser(tokenString, cb, next)
    }
    return next()
  }
}

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {object} webConfig
 * @param repositories
 * @param {BackendEmitter} emitter
 * @param {function} transformer
 * @param {JSONLD} jsonld
 * @param {Array.<Function>} tokenParsers
 */
export function rheactorjsExpressConfig (app, config, webConfig, repositories, emitter, transformer = transform, jsonld = undefined, tokenParsers = []) {
  const apiHost = new URIValue(config.get('api_host'))
  if (!jsonld) {
    jsonld = JSONLD(apiHost)
  }

  const base = rheactorjsExpressBaseConfig(config.get('environment'), webConfig.mimeType, app)

  app.use(passport.initialize())

  let verifyToken = (token) => {
    return verify(apiHost, config.get('public_key'), token) // this is wrapped in a function because public_key is not available immediately
  }
  passport.use(new BearerStrategy(chainedTokenParsers([...tokenParsers, tokenBearerStrategy(verifyToken)])))

  let tokenAuth = passport.authenticate('bearer', {session: false, failWithError: true})

  indexRoute(app, jsonld)
  statusRoute(app, config)
  registrationRoute(app, config, emitter, repositories.user, base.sendHttpProblem)
  tokenRoutes(app, config, tokenAuth, jsonld, base.sendHttpProblem)
  loginRoute(app, config, repositories.user, jsonld, base.sendHttpProblem)
  passwordChangeRoute(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  profileRoute(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  activateAccountRoute(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  userRoute(app, config, emitter, repositories.user, tokenAuth, jsonld, base.sendHttpProblem, transformer.bind(null, jsonld))

  return {
    jsonld,
    tokenAuth,
    sendHttpProblem: base.sendHttpProblem,
    verifyToken
  }
}
