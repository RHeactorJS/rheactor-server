/* global describe expect it beforeAll */

import Promise from 'bluebird'
import helper from '../helper'

import {CreateUserCommand} from '../../../src/command/user/create'
import {EmailValue} from '@rheactorjs/value-objects'
import {UserModel} from '../../../src/model/user'
import {ModelEvent} from '@rheactorjs/event-store'
import emitter from '../../../src/services/emitter'

describe('UserRepository', function () {
  beforeAll(helper.clearDb)

  let repository = helper.repositories.user

  let findByEmailRetry = (email) => {
    return repository.findByEmail(email)
      .then((user) => {
        if (!user) {
          return Promise.delay(500).then(findByEmailRetry.bind(null, email))
        }
        return user
      })
  }

  describe('persist', () => {
    it('should persist CreateUserCommands', (done) => {
      let email1 = new EmailValue('john.doe@example.invalid')
      let email2 = new EmailValue('jane.doe@example.invalid')

      let c1 = new CreateUserCommand(email1, 'John', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')
      let c2 = new CreateUserCommand(email2, 'Jane', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')

      Promise.join(emitter.emit(c1), emitter.emit(c2))
        .spread((e1, e2) => {
          expect(e1).toBeInstanceOf(ModelEvent)
          expect(e2).toBeInstanceOf(ModelEvent)
          return Promise
            .join(
              repository.getById(e1.aggregateId),
              repository.getById(e2.aggregateId)
            )
            .spread((u1, u2) => {
              expect(u1.email.toString()).toEqual('john.doe@example.invalid')
              expect(u1.meta.version).toEqual(1)
              expect(u2.email.toString()).toEqual('jane.doe@example.invalid')
              expect(u2.meta.version).toEqual(1)
              done()
            })
        })
    })

    it('should not persist two users with the same email address', (done) => {
      let email = new EmailValue('jill.doe@example.invalid')

      let c1 = new CreateUserCommand(email, 'Jill', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')
      let c2 = new CreateUserCommand(email, 'Another Jill', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')

      emitter.emit(c1)
      emitter
        .emit(c2)
        .catch((err) => {
          expect(err.name).toEqual('EntryAlreadyExistsError')
          expect(err.message).toContain('jill.doe@example.invalid')
          done()
        })
    })
  })

  describe('.getById()', () => {
    it('should return UserModels', (done) => {
      let email = new EmailValue('john.doe@example.invalid')
      findByEmailRetry(email)
        .then((user) => {
          return repository.getById(user.meta.id)
        })
        .then((user) => {
          expect(user).toBeInstanceOf(UserModel)
          done()
        })
    })
  })

  describe('.findById()', () => {
    it('should return UserModels', (done) => {
      let email = new EmailValue('john.doe@example.invalid')
      findByEmailRetry(email)
        .then((user) => {
          return repository.findById(user.meta.id)
        })
        .then((user) => {
          expect(user).toBeInstanceOf(UserModel)
          done()
        })
    })
  })
})
