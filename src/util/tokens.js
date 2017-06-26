import Promise from 'bluebird'
import jwt from 'jsonwebtoken'
import {User, JsonWebToken, JsonWebTokenType} from 'models'
import JSONLD from '../config/jsonld'
import {URIValue, URIValueType} from 'value-objects'
import {Object as ObjectType, Integer as IntegerType, String as StringType} from 'tcomb'
import {UserModelType} from '../model/user'

/**
 * @param {String} iss
 * @param {URIValue} apiHost
 * @param {String} privateKey
 * @param {Number} tokenLifetime
 * @param {UserModel} user
 * @param {Object} payload
 * @returns {Promise.<JsonWebToken>}
 */
const sign = (iss, apiHost, privateKey, tokenLifetime, user, payload = {}) => {
  StringType(iss)
  URIValueType(apiHost)
  StringType(privateKey)
  IntegerType(tokenLifetime)
  UserModelType(user)
  ObjectType(payload)
  let jsonld = JSONLD(apiHost)
  let aggregateMeta = {}
  aggregateMeta[user.constructor.name] = user.$aggregateMeta
  payload.$aggregateMeta = aggregateMeta
  return Promise.try(() => {
    let token = jwt.sign(
      payload,
      privateKey,
      {
        algorithm: 'RS256',
        issuer: iss,
        subject: jsonld.createId(User.$context, user.aggregateId()).toString(),
        expiresIn: tokenLifetime
      }
    )
    return new JsonWebToken(token)
  })
}

/**
 * @param {String} apiHost
 * @param {String} privateKey
 * @param {Number} tokenLifetime
 * @param {UserModel} user
 * @returns {Promise.<JsonWebToken>}
 */
export const lostPasswordToken = sign.bind(null, 'password-change')

/**
 * {JsonWebToken} token
 * @returns {boolean}
 */
export const isLostPasswordToken = (token) => {
  JsonWebTokenType(token)
  return token.iss === 'password-change'
}

/**
 * @param {String} apiHost
 * @param {String} privateKey
 * @param {Number} tokenLifetime
 * @param {UserModel} user
 * @returns {Promise.<JsonWebToken>}
 */
export const accountActivationToken = sign.bind(null, 'account-activation')

/**
 * {JsonWebToken} token
 * @returns {boolean}
 */
export const isAccountActivationToken = (token) => {
  JsonWebTokenType(token)
  return token.iss === 'account-activation'
}

/**
 * @param {String} apiHost
 * @param {String} privateKey
 * @param {Number} tokenLifetime
 * @param {UserModel} user
 * @param {EmailValue} email
 * @returns {Promise.<JsonWebToken>}
 */
export const changeEmailToken = sign.bind(null, 'email-change')

/**
 * {JsonWebToken} token
 * @returns {boolean}
 */
export const isChangeEmailToken = (token) => {
  JsonWebTokenType(token)
  return token.iss === 'email-change'
}

/**
 * @param {String} apiHost
 * @param {String} publicKey
 * @param {String} token
 * @returns {Promise.<JsonWebToken>}
 */
export const verify = (apiHost, publicKey, token) => {
  URIValueType(apiHost)
  StringType(publicKey)
  StringType(token)
  const jsonld = JSONLD(apiHost)
  return Promise.try(() => {
    const decoded = jwt.verify(token, publicKey, {algorithms: ['RS256']})
    if (decoded) {
      const t = new JsonWebToken(token)
      t.payload.sub_id = jsonld.parseId(User.$context, new URIValue(decoded.sub))
      return t
    }
  })
}
