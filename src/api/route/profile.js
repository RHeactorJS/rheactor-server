import Promise from 'bluebird'
import UpdateUserPropertyCommand from '../../command/user/update-property'
import UpdateUserAvatarCommand from '../../command/user/update-avatar'
import ActivateUserCommand from '../../command/user/activate'
import DeactivateUserCommand from '../../command/user/deactivate'
import {ValidationFailedError, ConflictError, AccessDeniedError} from '@rheactorjs/errors'
import Joi from 'joi'
import {checkVersion} from '../check-version'
import _merge from 'lodash/merge'
import verifySuperUser from '../verify-superuser'
import {EmailValue, URIValue} from 'value-objects'
import ChangeUserEmailCommand from '../../command/user/email-change'
import SendUserEmailChangeConfirmationLinkCommand from '../../command/user/send-email-change-confirmation-link'
import {isChangeEmailToken} from '../../util/tokens'

/**
 * Manages profile change requests.
 *
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {UserRepository} userRepository
 * @param {express.Middleware} tokenAuth
 * @param {function} sendHttpProblem
 */
export default function (app, config, emitter, userRepository, tokenAuth, sendHttpProblem) {
  /**
   * A user may request a to use a new email address, by supplying it to this endpoint
   * which will generate a token that is sent to the new address.
   */
  app.put('/api/user/:id/email-change', tokenAuth, (req, res) => Promise
    .try(() => {
      if (req.params.id !== req.user) throw AccessDeniedError(req.url, 'This is not you.')
      const schema = Joi.object().keys({
        value: Joi.string().required().email()
      })
      const query = _merge({}, req.body)
      const v = Joi.validate(req.body, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }
      return userRepository.findByEmail(new EmailValue(v.value.value))
        .then(existingUser => {
          if (existingUser) throw new ConflictError('Email address already in use: ' + v.value.value)
          return userRepository.getById(req.user)
        })
        .then(user => emitter.emit(new SendUserEmailChangeConfirmationLinkCommand(user, new EmailValue(v.value.value)), user))
    })
    .then(() => res.status(201).send())
    .catch(err => sendHttpProblem(res, err))
  )

  /**
   * The user then can use supply the token to this endpoint he received from calling '/api/user/:id/email-change'
   * to confirm the change.
   */
  app.put('/api/user/:id/email-change/confirm', tokenAuth, (req, res) => Promise
    .try(() => {
      if (req.params.id !== req.user) throw AccessDeniedError(req.url, 'This is not you.')
      if (!isChangeEmailToken(req.authInfo)) throw new AccessDeniedError(req.url, 'Not a password change token')
      return userRepository.getById(req.user)
    })
    .then(user => {
      checkVersion(req.authInfo.payload['$aggregateMeta'][user.constructor.name].version, user)
      return emitter.emit(new ChangeUserEmailCommand(user, new EmailValue(req.authInfo.payload.email), user))
        .then(event => res
          .header('etag', user.aggregateVersion())
          .header('last-modified', new Date(event.createdAt).toUTCString())
          .status(204).send())
    })
    .catch(err => sendHttpProblem(res, err))
  )

  /**
   * Admins can change emails of users
   */
  app.put('/api/user/:id/email', tokenAuth, (req, res) => Promise
    .join(
      verifySuperUser(req, userRepository),
      userRepository.getById(req.params.id)
    )
    .spread((superUser, user) => {
      const schema = Joi.object().keys({
        value: Joi.string().required().email()
      })
      const query = _merge({}, req.body)
      const v = Joi.validate(req.body, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }
      return userRepository.findByEmail(new EmailValue(v.value.value))
        .then(existingUser => {
          if (existingUser) throw new ConflictError('Email address already in use: ' + v.value.value)
          checkVersion(req.headers['if-match'], user)
          return emitter.emit(new ChangeUserEmailCommand(user, new EmailValue(v.value.value), superUser))
        })
        .then(event => res
          .header('etag', user.aggregateVersion())
          .header('last-modified', new Date(event.createdAt).toUTCString())
          .status(204)
          .send()
        )
    })
    .catch(err => sendHttpProblem(res, err))
  )

  /**
   * Generic endpoint for changing users, also used by admins
   */
  app.put('/api/user/:id/:property', tokenAuth, (req, res) => Promise
    .try(() => {
      const schema = Joi.object().keys({
        id: Joi.string().min(1).trim(),
        property: Joi.string().only(['firstname', 'lastname', 'active', 'avatar', 'preferences']).required().trim(),
        value: Joi.any().required()
      })
      const query = _merge({}, req.body)
      query.property = req.params.property
      query.id = req.params.id
      const v = Joi.validate(query, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }
      const property = v.value.property
      const value = v.value.value
      return Promise
        .try(() => {
          if (req.params.id !== req.user || property === 'active') {
            return Promise.join(
              userRepository.getById(req.params.id),
              verifySuperUser(req, userRepository)
            )
          } else {
            return Promise.join(
              userRepository.getById(req.user),
              null
            )
          }
        })
        .spread((user, author) => {
          author = author || user
          checkVersion(req.headers['if-match'], user)
          let cmd
          switch (property) {
            case 'active':
              if (value) {
                if (user.isActive) throw new ConflictError('User is active!')
                cmd = new ActivateUserCommand(user, author)
              } else {
                if (!user.isActive) throw new ConflictError('User is not active!')
                cmd = new DeactivateUserCommand(user, author)
              }
              break
            case 'avatar':
              const trustedAvatarURL = new RegExp(config.get('trustedAvatarURL'))
              if (!trustedAvatarURL.test(value)) {
                throw new ValidationFailedError(`URL not allowed: ${value}`)
              }
              cmd = new UpdateUserAvatarCommand(user, new URIValue(value), author)
              break
            default:
              if (user[property] === value) throw new ConflictError(property + ' not changed ("' + value + '")!')
              cmd = new UpdateUserPropertyCommand(user, property, value, author)
          }
          return emitter.emit(cmd)
            .then(event => res
              .header('etag', user.aggregateVersion())
              .header('last-modified', new Date(event.createdAt).toUTCString())
              .status(204).send())
        })
    })

    .catch(err => sendHttpProblem(res, err))
  )
}
