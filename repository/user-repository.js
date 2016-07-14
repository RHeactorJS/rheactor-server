'use strict'

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const AggregateIndex = require('rheactor-event-store/aggregate-index')
const util = require('util')
const UserModel = require('../model/user')
const EntryNotFoundError = require('rheactor-value-objects/errors/entry-not-found')
const Promise = require('bluebird')
const UserCreatedEvent = require('../event/user/created')

/**
 * Creates a new user repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var UserRepository = function (redis) {
  AggregateRepository.call(this, UserModel, 'user', redis)
  this.index = new AggregateIndex(this.aggregateAlias, redis)
}
util.inherits(UserRepository, AggregateRepository)

/**
 * Find a user by email
 *
 * @param {EmailValue} email
 * @return {Promise.<UserModel>}
 */
UserRepository.prototype.findByEmail = function (email) {
  let self = this
  return self
    .getByEmail(email)
    .catch(err => EntryNotFoundError.is(err), () => {
      return null
    })
}

/**
 * Get a user by email
 *
 * @param {EmailValue} email
 * @return {Promise.<UserModel>}
 */
UserRepository.prototype.getByEmail = function (email) {
  let self = this
  return self.index.find('email', email.toString())
    .then((id) => {
      if (!id) {
        throw new EntryNotFoundError('User with email "' + email.toString() + '" not found')
      }
      return self.constructor.super_.prototype.getById.call(self, id)
    })
}

/**
 * Create a new user
 *
 * The precondition is that a user with the same email address must not exist,
 * therefore the email address index for this aggregate is consulted before
 *
 * @param {UserModel} user
 * @returns {Promise.<Number>} of the id
 */
UserRepository.prototype.add = function (user) {
  let self = this

  let data = {
    email: user.email.toString(),
    firstname: user.firstname,
    lastname: user.lastname,
    password: user.password,
    isActive: user.isActive
  }
  if (user.avatar) {
    data.avatar = user.avatar.toString()
  }

  return Promise
    .resolve(self.redis.incrAsync(self.aggregateAlias + ':id'))
    .then((id) => {
      return self.index.addIfNotPresent('email', data.email, id)
        .then(() => {
          let event = new UserCreatedEvent(id, data)
          return self.eventStore
            .persist(event)
            .then(() => {
              user.applyEvent(event)
              return event
            })
        })
    })
}

module.exports = UserRepository
