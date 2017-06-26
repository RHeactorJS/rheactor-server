import Promise from 'bluebird'
import {EmailValue} from '@rheactorjs/value-objects'
import {CreateUserCommand} from '../../command/user/create'
import {ValidationFailedError, ConflictError} from '@rheactorjs/errors'
import bcrypt from 'bcrypt'
Promise.promisifyAll(bcrypt)

/**
 * @param {express.app} app
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 * @param {UserRepository} userRepository
 * @param {function} sendHttpProblem
 */
export default function (app, config, emitter, userRepository, sendHttpProblem) {
  /**
   * Register a new account, needs to be activated afterwards
   */
  app.post('/api/registration', (req, res) => Promise
    .try(() => {
      if (!req.body.password) {
        throw new ValidationFailedError('missing password')
      }
      return bcrypt
        .genSaltAsync(config.get('bcrypt_rounds'))
        .then(bcrypt.hashAsync.bind(bcrypt, req.body.password))
        .then((hashedPassword) => {
          delete req.body.password
          let email = new EmailValue(req.body.email)
          return userRepository.findByEmail(email)
            .then((user) => {
              if (user) {
                throw new ConflictError('Already registered!')
              }
              emitter.emit(new CreateUserCommand(email, req.body.firstname, req.body.lastname, hashedPassword))
            })
        })
    })
    .then(() => {
      return res
        .status(201)
        .send()
    })
    .catch(sendHttpProblem.bind(null, res))
  )
}
