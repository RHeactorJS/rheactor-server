import {AggregateRepository, AggregateIndex, ModelEvent, ModelEventType} from '@rheactorjs/event-store'
import {UserModel, UserModelType, MaybeUserModelType} from '../model/user'
import {EntryNotFoundError} from '@rheactorjs/errors'
import {EmailValueType} from '@rheactorjs/value-objects'
import Promise from 'bluebird'
import {UserCreatedEvent, UserEmailChangedEvent} from '../event/user'
import {PaginationType} from '../util/pagination'

export class UserRepository extends AggregateRepository {
  /**
   * Creates a new user repository
   *
   * @param {redis.client} redis
   * @constructor
   */
  constructor (redis) {
    super(UserModel, 'user', redis)
    this.index = new AggregateIndex(this.aggregateAlias, redis)
  }

  /**
   * Find a user by email
   *
   * @param {EmailValue} email
   * @return {Promise.<UserModel>}
   */
  findByEmail (email) {
    EmailValueType(email)
    return this
      .getByEmail(email)
      .catch(err => EntryNotFoundError.is(err), () => {
        return null
      })
  }

  /**
   * Find all users
   *
   * @param {Pagination} pagination
   * @return {Promise.<Array.<UserModel>>}
   */
  listAll (pagination) {
    PaginationType(pagination)
    return this.index.getAll('email')
      .then(userIds => {
        const total = userIds.length
        return Promise.map(pagination.splice(userIds), userId => this.getById(userId))
          .then(users => pagination.result(users, total))
      })
  }

  /**
   * Get a user by email
   *
   * @param {EmailValue} email
   * @return {Promise.<UserModel>}
   */
  getByEmail (email) {
    EmailValueType(email)
    return this.index.find('email', email.toString())
      .then((id) => {
        if (!id) {
          throw new EntryNotFoundError('User with email "' + email.toString() + '" not found')
        }
        return this.getById(id)
      })
  }

  /**
   * Create a new user
   *
   * The precondition is that a user with the same email address must not exist,
   * therefore the email address index for this aggregate is consulted before
   *
   * @param {UserModel} user
   * @param {UserModel} author Can be empty, if user is creating themselves
   * @returns {Promise.<Number>} of the id
   */
  add (user, author) {
    UserModelType(user)
    MaybeUserModelType(author)
    const data = {
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
      .resolve(this.redis.incrAsync(this.aggregateAlias + ':id'))
      .then((id) => {
        id = '' + id
        return this.index.addIfNotPresent('email', data.email, id)
          .then(() => {
            const event = new ModelEvent(id, UserCreatedEvent, data, new Date(), author ? author.aggregateId() : undefined)
            return this.eventStore
              .persist(event)
              .then(() => {
                user.applyEvent(event)
                return event
              })
          })
      })
  }

  /**
   * Persist a user event
   *
   * @param {ModelEvent} modelEvent
   * @return {ModelEvent}
   */
  persistEvent (modelEvent) {
    ModelEventType(modelEvent)
    return AggregateRepository.prototype.persistEvent.call(this, modelEvent)
      .then(() => this.postPersist(modelEvent))
      .then(() => modelEvent)
  }

  /**
   * Persist a user event
   *
   * @param {ModelEvent} modelEvent
   */
  postPersist (modelEvent) {
    if (modelEvent.name === UserEmailChangedEvent) {
      return Promise
        .join(
          this.index.remove('email', modelEvent.data.oldemail, modelEvent.aggregateId),
          this.index.add('email', modelEvent.data.email, modelEvent.aggregateId)
        )
        .then(() => modelEvent)
    }
    return Promise.resolve(modelEvent)
  }
}
