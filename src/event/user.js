import {UserModelType} from '../model/user'
import {EmailValueType} from '@rheactorjs/value-objects'
import {JsonWebTokenType} from '@rheactorjs/models'

export const UserActivatedEvent = 'UserActivatedEvent'
export const UserDeactivatedEvent = 'UserDeactivatedEvent'
export const UserCreatedEvent = 'UserCreatedEvent'
export const UserPasswordChangedEvent = 'UserPasswordChangedEvent'
export const UserEmailChangedEvent = 'UserEmailChangedEvent'
export const UserAvatarUpdatedEvent = 'UserAvatarUpdatedEvent'
export const UserPropertyChangedEvent = 'UserPropertyChangedEvent'
export const UserPreferencesChangedEvent = 'UserPreferencesChangedEvent'
export const SuperUserPermissionsGrantedEvent = 'SuperUserPermissionsGrantedEvent'
export const SuperUserPermissionsRevokedEvent = 'SuperUserPermissionsRevokedEvent'

/**
 * @param {UserModel} user
 * @param {JsonWebToken} token
 * @constructor
 */
export function UserActivationLinkSentEvent (user, token) {
  UserModelType(user)
  JsonWebTokenType(token)
  this.user = user
  this.token = token
}

/**
 * @param {UserModel} user
 * @param {EmailValue} email
 * @param {JsonWebToken} token
 * @constructor
 */
export function UserEmailChangeConfirmationLinkSentEvent (user, email, token) {
  UserModelType(user)
  EmailValueType(email)
  JsonWebTokenType(token)
  this.user = user
  this.email = email
  this.token = token
}

/**
 * @param {UserModel} user
 * @param {JsonWebToken} token
 * @constructor
 */
export function UserPasswordChangeConfirmationLinkSentEvent (user, token) {
  UserModelType(user)
  JsonWebTokenType(token)
  this.user = user
  this.token = token
}
