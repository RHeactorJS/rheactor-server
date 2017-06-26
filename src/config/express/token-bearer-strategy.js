import Promise from 'bluebird'
import JsonWebTokenError from 'jsonwebtoken/lib/JsonWebTokenError'
import {TokenExpiredError} from '@rheactorjs/errors'

export default (verifyToken) => {
  return (token, cb) => {
    return Promise
      .resolve(verifyToken(token))
      .then((t) => {
        // eslint-disable-next-line standard/no-callback-literal
        if (t.iss === 'user') return cb(false) // Do not allow user issued tokens
        return cb(null, t.payload.sub_id, t)
      })
      .catch(TokenExpiredError, JsonWebTokenError, () => {
        return cb(null, false)
      })
      .catch((err) => {
        return cb(err)
      })
  }
}
