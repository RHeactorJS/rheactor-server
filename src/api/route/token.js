import Promise from 'bluebird'
import jwt from 'jsonwebtoken'
import JsonWebTokenError from 'jsonwebtoken/lib/JsonWebTokenError'
import {ValidationFailedError} from '@rheactorjs/errors'
import {JsonWebToken, User} from '@rheactorjs/models'
import Joi from 'joi'

export const tokenRoutes = (app, config, tokenAuth, jsonld, sendHttpProblem) => {
  app.post('/api/token/verify', (req, res) => Promise
    .try(() => {
      const match = req.headers.authorization && req.headers.authorization.match(/^Bearer (.+)/)
      if (!match[1]) return res.status(400).send()
      return jwt.verify(match[1], config.get('public_key'), {algorithms: ['RS256']})
    })
    .then(token => {
      return res.status(204).send()
    })
    .catch(JsonWebTokenError, () => res.status(401).send())
    .catch(err => sendHttpProblem(res, err))
  )

  app.post('/api/token/renew', tokenAuth, (req, res) => Promise
    .try(() => jwt.sign(
      {},
      config.get('private_key'),
      {
        algorithm: 'RS256',
        issuer: 'renew',
        subject: jsonld.createId(User.$context, req.user).toString(),
        expiresIn: config.get('token_lifetime')
      }
    ))
    .then(token => res.status(201).send(new JsonWebToken(token, jsonld.createLinks(JsonWebToken.$context, token))))
    .catch(err => {
      err.punish = true
      return sendHttpProblem(res, err)
    })
  )

  app.post('/api/token/create', tokenAuth, (req, res) => Promise
    .try(() => {
      const schema = Joi.object().keys({
        aud: Joi.string().trim().required()
      })
      const v = Joi.validate(req.body, schema, {stripUnknown: true})
      if (v.error) {
        throw new ValidationFailedError('Validation failed', req.body, v.error)
      }
      return jwt.sign(
        {},
        config.get('private_key'),
        {
          algorithm: 'RS256',
          issuer: 'user', // User issued tokens will not be accepted by tokenAuth
          audience: v.value.aud,
          subject: jsonld.createId(User.$context, req.user).toString(),
          expiresIn: config.get('token_lifetime')
        }
      )
    })
    .then(token => res.status(201).send(new JsonWebToken(token, jsonld.createLinks(JsonWebToken.$context, token).filter(l => l.rel !== 'token-renew'))))
    .catch(err => sendHttpProblem(res, err))
  )
}
