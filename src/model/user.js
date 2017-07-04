import {ModelEvent, ImmutableAggregateRoot, AggregateMeta} from '@rheactorjs/event-store'
import {ValidationFailedError, ConflictError, UnhandledDomainEventError} from '@rheactorjs/errors'
import {String as StringType, Any as AnyType, Boolean as BooleanType, irreducible, maybe, dict, Date as DateType} from 'tcomb'
import {URIValue, URIValueType, MaybeURIValueType, EmailValue, EmailValueType} from '@rheactorjs/value-objects'
import {SuperUserPermissionsGrantedEvent, UserPropertyChangedEvent, UserPreferencesChangedEvent, UserAvatarUpdatedEvent, UserActivatedEvent, UserDeactivatedEvent, UserEmailChangedEvent, UserCreatedEvent, UserPasswordChangedEvent, SuperUserPermissionsRevokedEvent} from '../event/user'
const PreferencesType = dict(StringType, AnyType)
const MaybeDateType = maybe(DateType)

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
  return new ModelEvent(self.meta.id, UserPropertyChangedEvent, {property, value}, new Date(), author.meta.id)
}

export class UserModel extends ImmutableAggregateRoot {
  /**
   * @param {EmailValue} email
   * @param {String} firstname
   * @param {String} lastname
   * @param {String} password
   * @param {Boolean} active
   * @param {URIValue} avatar
   * @param {Object} preferences
   * @param {Date} activatedAt
   * @param {Date} deactivatedAt
   * @param {Boolean} superUser
   * @param {AggregateMeta} meta
   * @constructor
   * @throws ValidationFailedError if the creation fails due to invalid data
   */
  constructor (email, firstname, lastname, password, active = false, avatar, preferences = {}, activatedAt = undefined, deactivatedAt = undefined, superUser = false, meta) {
    super(meta)
    this.email = EmailValueType(email, ['UserModel()', 'email:EmailValue'])
    this.firstname = StringType(firstname, ['UserModel()', 'firstname:String'])
    this.lastname = StringType(lastname, ['UserModel()', 'lastname:String'])
    this.password = StringType(password, ['UserModel()', 'password:String'])
    this.isActive = BooleanType(active, ['UserModel()', 'active:Boolean'])
    this.activatedAt = (this.isActive) ? MaybeDateType(activatedAt, ['UserModel()', 'activatedAt:?Date']) || new Date() : undefined
    this.deactivatedAt = MaybeDateType(deactivatedAt, ['UserModel()', 'deactivatedAt:?Date'])
    this.avatar = MaybeURIValueType(avatar, ['UserModel()', 'avatar:?URIValue'])
    this.superUser = BooleanType(superUser, ['UserModel()', 'superUser:Boolean'])
    this.preferences = PreferencesType(preferences, ['UserModel()', 'preferences:Preferences'])
    this.name = [this.firstname, this.lastname].join(' ')
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
    return new ModelEvent(this.meta.id, UserPreferencesChangedEvent, preferences, new Date(), author.meta.id)
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
    return new ModelEvent(this.meta.id, UserPasswordChangedEvent, {password}, new Date(), author.meta.id)
  }

  /**
   * @param {URIValue} avatar
   * @param {UserModel} author
   * @returns {ModelEvent}
   */
  setAvatar (avatar, author) {
    URIValueType(avatar)
    UserModelType(author)
    return new ModelEvent(this.meta.id, UserAvatarUpdatedEvent, {avatar: avatar.toString()}, new Date(), author.meta.id)
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
    return new ModelEvent(this.meta.id, UserActivatedEvent, {}, new Date(), author.meta.id)
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
    return new ModelEvent(this.meta.id, UserDeactivatedEvent, {}, new Date(), author.meta.id)
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
    return new ModelEvent(this.meta.id, SuperUserPermissionsGrantedEvent, {}, new Date(), author.meta.id)
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
    return new ModelEvent(this.meta.id, SuperUserPermissionsRevokedEvent, {}, new Date(), author.meta.id)
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
    return new ModelEvent(this.meta.id, UserEmailChangedEvent, {email: email.toString(), oldemail}, new Date(), author.meta.id)
  }

  /**
   * Applies the event
   *
   * @param {ModelEvent} event
   * @param {UserModel|undefined} user
   * @return {UserModel}
   */
  static applyEvent (event, user) {
    const {name, data: {email, firstname, lastname, password, isActive, avatar, preferences, property, value}, createdAt, aggregateId} = event
    switch (name) {
      case UserCreatedEvent:
        return new UserModel(new EmailValue(email), firstname, lastname, password, isActive, avatar ? new URIValue(avatar) : undefined, {}, undefined, undefined, false, new AggregateMeta(aggregateId, 1, createdAt))
      case UserPasswordChangedEvent:
        return new UserModel(user.email, user.firstname, user.lastname, password, user.isActive, user.avatar, user.preferences, user.activatedAt, user.deactivatedAt, user.superUser, user.meta.updated(createdAt))
      case UserEmailChangedEvent:
        return new UserModel(new EmailValue(email), user.firstname, user.lastname, user.password, user.isActive, user.avatar, user.preferences, user.activatedAt, user.deactivatedAt, user.superUser, user.meta.updated(createdAt))
      case UserActivatedEvent:
        return new UserModel(user.email, user.firstname, user.lastname, user.password, true, user.avatar, user.preferences, createdAt, user.deactivatedAt, user.superUser, user.meta.updated(createdAt))
      case UserDeactivatedEvent:
        return new UserModel(user.email, user.firstname, user.lastname, user.password, false, user.avatar, user.preferences, user.activatedAt, createdAt, user.superUser, user.meta.updated(createdAt))
      case UserAvatarUpdatedEvent:
        return new UserModel(user.email, user.firstname, user.lastname, user.password, user.isActive, new URIValue(avatar), user.preferences, user.activatedAt, user.deactivatedAt, user.superUser, user.meta.updated(createdAt))
      case SuperUserPermissionsGrantedEvent:
        return new UserModel(user.email, user.firstname, user.lastname, user.password, user.isActive, user.avatar, user.preferences, user.activatedAt, user.deactivatedAt, true, user.meta.updated(createdAt))
      case SuperUserPermissionsRevokedEvent:
        return new UserModel(user.email, user.firstname, user.lastname, user.password, user.isActive, user.avatar, user.preferences, user.activatedAt, user.deactivatedAt, false, user.meta.updated(createdAt))
      case UserPropertyChangedEvent:
        const userdata = {
          firstname: user.firstname, lastname: user.lastname
        }
        userdata[property] = value
        return new UserModel(user.email, userdata.firstname, userdata.lastname, user.password, user.isActive, user.avatar, user.preferences, user.activatedAt, user.deactivatedAt, false, user.meta.updated(createdAt))
      case UserPreferencesChangedEvent:
        return new UserModel(user.email, user.firstname, user.lastname, user.password, user.isActive, user.avatar, preferences, user.activatedAt, user.deactivatedAt, user.superUser, user.meta.updated(createdAt))
      default:
        throw new UnhandledDomainEventError(event.name)
    }
  }
}

export const UserModelType = irreducible('UserModelType', x => x instanceof UserModel)
export const MaybeUserModelType = maybe(UserModelType)
