import {ModelEvent, AggregateRoot} from 'event-store'
import {ValidationFailedError, ConflictError, UnhandledDomainEventError} from '@rheactorjs/errors'
import {String as StringType, Any as AnyType, Boolean as BooleanType, irreducible, maybe, dict} from 'tcomb'
import {URIValue, URIValueType, MaybeURIValueType, EmailValue, EmailValueType} from '@rheactorjs/value-objects'
import {SuperUserPermissionsGrantedEvent, UserPropertyChangedEvent, UserPreferencesChangedEvent, UserAvatarUpdatedEvent, UserActivatedEvent, UserDeactivatedEvent, UserEmailChangedEvent, UserCreatedEvent, UserPasswordChangedEvent, SuperUserPermissionsRevokedEvent} from '../event/user'
const PreferencesType = dict(StringType, AnyType)

const passwordRegex = /^\$2a\$\d+\$.+/

/**
 * @param {UserModel} self
 * @param {string} property
 * @param {*} value
 * @param {UserModel} author
 * @returns {ModelEvent}
 */
const stringPropertyChange = (self, property, value, author) => {
  StringType(property)
  AnyType(value)
  UserModelType(author)
  if (value === self[property]) throw new ConflictError(property + ' not changed!')
  self[property] = value
  self.updated()
  return new ModelEvent(self.aggregateId(), UserPropertyChangedEvent, {property, value}, self.updatedAt(), author.aggregateId())
}

export class UserModel extends AggregateRoot {
  /**
   * @param {EmailValue} email
   * @param {String} firstname
   * @param {String} lastname
   * @param {String} password
   * @param {Boolean} active
   * @param {URIValue} avatar
   * @param {Object} preferences
   * @constructor
   * @throws ValidationFailedError if the creation fails due to invalid data
   */
  constructor (email, firstname, lastname, password, active = false, avatar, preferences = {}) {
    super()
    EmailValueType(email)
    StringType(firstname)
    StringType(lastname)
    StringType(password)
    BooleanType(active)
    MaybeURIValueType(avatar)
    PreferencesType(preferences)
    this.email = email
    this.firstname = firstname
    this.lastname = lastname
    this.password = password
    this.isActive = active
    this.activatedAt = (active) ? new Date() : undefined
    this.avatar = avatar
    this.superUser = false
    this.preferences = preferences
  }

  /**
   * @param {string} firstname
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  setFirstname (firstname, author) {
    return stringPropertyChange(this, 'firstname', firstname, author)
  }

  /**
   * @param {string} lastname
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  setLastname (lastname, author) {
    return stringPropertyChange(this, 'lastname', lastname, author)
  }

  /**
   * @param {object} preferences
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  setPreferences (preferences, author) {
    PreferencesType(preferences, ['UserModel', 'setPreferences()', 'preferences:Map(String: Any)'])
    UserModelType(author)
    this.preferences = preferences
    this.updated()
    return new ModelEvent(this.aggregateId(), UserPreferencesChangedEvent, preferences, this.updatedAt(), author.aggregateId())
  }

  /**
   * @param {String} password
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws ValidationFailedError
   */
  setPassword (password, author) {
    StringType(password)
    UserModelType(author)
    if (!passwordRegex.test(password)) {
      throw new ValidationFailedError('UserModel.password validation failed')
    }
    this.password = password
    this.updated()
    return new ModelEvent(this.aggregateId(), UserPasswordChangedEvent, {password}, this.updatedAt(), author.aggregateId())
  }

  /**
   * @param {URIValue} avatar
   * @param {UserModel} author
   * @returns {ModelEvent}
   */
  setAvatar (avatar, author) {
    URIValueType(avatar)
    UserModelType(author)
    this.avatar = avatar
    this.updated()
    return new ModelEvent(this.aggregateId(), UserAvatarUpdatedEvent, {avatar: avatar.toString()}, this.updatedAt(), author.aggregateId())
  }

  /**
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  activate (author) {
    UserModelType(author)
    if (this.isActive) {
      throw new ConflictError('Already activated!')
    }
    this.isActive = true
    this.activatedAt = new Date()
    this.updated()
    return new ModelEvent(this.aggregateId(), UserActivatedEvent, {}, this.updatedAt(), author.aggregateId())
  }

  /**
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  deactivate (author) {
    UserModelType(author)
    if (!this.isActive) {
      throw new ConflictError('Not activated!')
    }
    this.isActive = false
    this.deactivatedAt = new Date()
    this.updated()
    return new ModelEvent(this.aggregateId(), UserDeactivatedEvent, {}, this.updatedAt(), author.aggregateId())
  }

  /**
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  grantSuperUserPermissions (author) {
    UserModelType(author)
    if (this.superUser) {
      throw new ConflictError('Already SuperUser!')
    }
    this.superUser = true
    this.updated()
    return new ModelEvent(this.aggregateId(), SuperUserPermissionsGrantedEvent, {}, this.updatedAt(), author.aggregateId())
  }

  /**
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  revokeSuperUserPermissions (author) {
    UserModelType(author)
    if (!this.superUser) {
      throw new ConflictError('Not SuperUser!')
    }
    this.superUser = false
    this.updated()
    return new ModelEvent(this.aggregateId(), SuperUserPermissionsRevokedEvent, {}, this.updatedAt(), author.aggregateId())
  }

  /**
   * @patam {EmailValue} email
   * @param {UserModel} author
   * @return {ModelEvent}
   * @throws {ConflictError}
   */
  setEmail (email, author) {
    EmailValueType(email)
    UserModelType(author)
    const oldemail = this.email ? this.email.toString() : undefined
    this.email = email
    this.updated()
    return new ModelEvent(this.aggregateId(), UserEmailChangedEvent, {email: email.toString(), oldemail}, this.updatedAt(), author.aggregateId())
  }

  /**
   * @returns {string}
   */
  name () {
    return [this.firstname, this.lastname].join(' ')
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   */
  applyEvent (event) {
    const data = event.data
    switch (event.name) {
      case UserCreatedEvent:
        this.email = new EmailValue(data.email)
        this.firstname = data.firstname
        this.lastname = data.lastname
        this.password = data.password
        this.isActive = data.isActive
        this.activatedAt = event.createdAt
        if (data.avatar) {
          this.avatar = new URIValue(data.avatar)
        }
        this.persisted(event.aggregateId, event.createdAt)
        this.preferences = {}
        break
      case UserPasswordChangedEvent:
        this.password = data.password
        this.updated(event.createdAt)
        break
      case UserEmailChangedEvent:
        this.email = new EmailValue(data.email)
        this.updated(event.createdAt)
        break
      case UserActivatedEvent:
        this.isActive = true
        this.activatedAt = event.createdAt
        this.updated(event.createdAt)
        break
      case UserDeactivatedEvent:
        this.isActive = false
        this.deactivatedAt = event.createdAt
        this.updated(event.createdAt)
        break
      case UserAvatarUpdatedEvent:
        this.avatar = new URIValue(data.avatar)
        this.updated(event.createdAt)
        break
      case SuperUserPermissionsGrantedEvent:
        this.superUser = true
        this.updated(event.createdAt)
        break
      case SuperUserPermissionsRevokedEvent:
        this.superUser = false
        this.updated(event.createdAt)
        break
      case UserPropertyChangedEvent:
        this[data.property] = data.value
        this.updated(event.createdAt)
        break
      case UserPreferencesChangedEvent:
        this.preferences = data
        this.updated(event.createdAt)
        break
      default:
        console.error('Unhandled UserModel event', event.name)
        throw new UnhandledDomainEventError(event.name)
    }
  }

  /**
   * Returns true if x is of type UserModel
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof UserModel) || (x && x.constructor && x.constructor.name === UserModel.name && 'email' in x && 'firstname' in x && 'lastname' in x && 'password' in x && 'isActive' in x)
  }
}

export const UserModelType = irreducible('UserModelType', UserModel.is)
export const MaybeUserModelType = maybe(UserModelType)
