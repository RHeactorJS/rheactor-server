import Promise from 'bluebird'
import jwt from 'jsonwebtoken'
import {User, JsonWebToken, JsonWebTokenType} from '@rheactorjs/models'
import JSONLD from '../config/jsonld'
import {URIValue, URIValueType} from '@rheactorjs/value-objects'
import {Object as ObjectType, Integer as IntegerType, String as StringType} from 'tcomb'
import {AggregateIdType, AggregateVersionType} from '@rheactorjs/event-store'

/**
 * @param {String} iss
 * @param {URIValue} apiHost
 * @param {String} privateKey
 * @param {Number} tokenLifetime
 * @param {{meta: {id:Number}}}
 * @param {Object} payload
 * @returns {Promise.<JsonWebToken>}
 */
const sign = (iss, apiHost, privateKey, tokenLifetime, {meta: {id, version}}, payload = {}) => {
  StringType(iss, ['tokens.sign()', 'iss:String'])
  URIValueType(apiHost, ['tokens.sign()', 'apiHost:URIValue'])
  StringType(privateKey, ['tokens.sign()', 'privateKey:String'])
  IntegerType(tokenLifetime, ['tokens.sign()', 'tokenLifetime:Integer'])
  AggregateIdType(id, ['tokens.sign()', 'id:AggregateId'])
  AggregateVersionType(version, ['tokens.sign()', 'version:AggregateVersion'])
  ObjectType(payload, ['tokens.sign()', 'payload:Object'])
  const jsonld = JSONLD(apiHost)
  return Promise.try(() => {
    let token = jwt.sign(
      {...payload, meta: {id, version}},
      privateKey,
      {
        algorithm: 'RS256',
        issuer: iss,
        subject: jsonld.createId(User.$context, id).toString(),
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
  JsonWebTokenType(token, 'tokens.isLostPasswordToken()', 'token:JsonWebToken')
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
  JsonWebTokenType(token, 'tokens.isAccountActivationToken()', 'token:JsonWebToken')
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
  JsonWebTokenType(token, 'tokens.isChangeEmailToken()', 'token:JsonWebToken')
  return token.iss === 'email-change'
}

/**
 * @param {String} apiHost
 * @param {String} publicKey
 * @param {String} token
 * @returns {Promise.<JsonWebToken>}
 */
export const verify = (apiHost, publicKey, token) => {
  URIValueType(apiHost, ['tokens.verify()', 'apiHost:URIValue'])
  StringType(publicKey, ['tokens.verify()', 'privateKey:String'])
  StringType(token, ['tokens.verify()', 'token:String'])
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
