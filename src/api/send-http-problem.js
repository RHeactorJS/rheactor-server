import Promise from 'bluebird'
import {HttpProblem} from 'models'
import {
  AccessDeniedError,
  EntryNotFoundError,
  ConflictError,
  EntryAlreadyExistsError,
  ValidationFailedError,
  EntryDeletedError,
  PaymentRequiredError
} from '@rheactorjs/errors'
import {URIValue} from 'value-objects'

export const HttpProblemFromException = (exception, status) => {
  if (HttpProblem.is(exception)) return exception
  const url = 'https://github.com/RHeactor/nucleus/wiki/HttpProblem#' +
    status +
    '?title=' + encodeURIComponent(exception.name) +
    '&detail=' + encodeURIComponent(exception.toString())
  return new HttpProblem(new URIValue(url), exception.name, status, exception.toString())
}

/**
 * @param {string} environment
 * @param res
 * @param err
 * @returns {Promise.<TResult>}
 */
export const sendHttpProblem = (environment, res, err) => {
  let status = 500
  let punish = false
  let punishTime = environment === 'production' ? 1000 : 0
  if (err.name === 'TokenExpiredError' || err.name === AccessDeniedError.name) {
    status = 403
    punish = true
  }
  if (err.name === EntryNotFoundError.name) {
    status = 404
  }
  if (err.name === ConflictError.name || err.name === EntryAlreadyExistsError.name) {
    status = 409
  }
  if (err.name === ValidationFailedError.name) {
    status = 400
  }
  if (err.name === EntryDeletedError.name) {
    status = 404
  }
  if (err.name === PaymentRequiredError.name) {
    status = 402
  }
  if (err.name === 'TypeError' && /^\[tcomb] /.test(err.message)) {
    status = 400
    err = new ValidationFailedError(err.message, {}, err)
  }
  if (status === 500) { // Unknown
    console.error(err.name)
    console.error(err.message)
    console.error(err.stack)
  }
  return Promise.delay(punish || err.punish ? punishTime : 0).then(() => {
    return res
      .status(status)
      .send(HttpProblemFromException(err, status))
  })
}
